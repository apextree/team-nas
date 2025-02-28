from flask import Blueprint, render_template, request, jsonify, session
from extensions import db
from models.user import User
from models.note import Note
from datetime import datetime
from sqlalchemy import text

notes_bp = Blueprint('notes', __name__, url_prefix='/apps/notes')

def get_current_user():
    """Helper function to get current authenticated user"""
    if 'user' not in session:
        return None
    return User.query.filter_by(username=session['user']).first()

@notes_bp.route('/')
def notes():
    """Render notes page with user's notes only"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401

    # Only get notes belonging to current user
    user_notes = Note.query.filter_by(user_id=current_user.id).order_by(Note.created_at.desc()).all()
    
    # Format dates consistently
    for note in user_notes:
        note.created_at = note.created_at.strftime('%Y-%m-%d %H:%M:%S')
        
    return render_template('notes.html', notes=user_notes, current_user_id=current_user.id)

@notes_bp.route('/create', methods=['POST'])
def create_note():
    """Create a new note for current user"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401

    title = request.form.get('title')
    content = request.form.get('content')

    if not title or not content:
        return jsonify({'success': False, 'error': 'Title and content are required'}), 400

    try:
        note = Note(
            title=title,
            content=content,
            created_at=datetime.now(),
            user_id=current_user.id
        )

        db.session.add(note)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Note created successfully',
            'note': {
                'id': note.id,
                'title': note.title,
                'content': note.content,
                'created_at': note.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'user_id': note.user_id
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@notes_bp.route('/search')
def search_notes():
    """Search only current user's notes"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401

    query = request.args.get('q', '')
    
    try:
        # Use SQLAlchemy ORM with filter conditions
        notes = Note.query.filter(
            Note.user_id == current_user.id,
            (Note.title.ilike(f'%{query}%') | Note.content.ilike(f'%{query}%'))
        ).order_by(Note.created_at.desc()).all()

        notes_list = []
        for note in notes:
            notes_list.append({
                'id': note.id,
                'title': note.title,
                'content': note.content,
                'created_at': note.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'user_id': note.user_id
            })

        return jsonify({
            'success': True,
            'notes': notes_list
        })
    except Exception as e:
        print(f"Search error: {str(e)}")  # Add logging for debugging
        return jsonify({'success': False, 'error': str(e)}), 500


@notes_bp.route('/delete/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    """Delete note only if it belongs to current user"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401

    try:
        note = Note.query.filter_by(id=note_id, user_id=current_user.id).first()
        if not note:
            return jsonify({'success': False, 'error': 'Note not found or unauthorized'}), 404

        db.session.delete(note)
        db.session.commit()

        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@notes_bp.route('/debug')
def debug_database():
    """Debug route to check database contents"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401

    # Only allow admin users to access debug info
    if not current_user.is_admin:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 403

    try:
        # Get only the current user's notes
        user_notes = Note.query.filter_by(user_id=current_user.id).all()
        
        debug_info = {
            'current_user': {
                'id': current_user.id,
                'username': current_user.username
            },
            'notes_count': len(user_notes),
            'notes': [{
                'id': note.id,
                'title': note.title,
                'created_at': note.created_at.strftime('%Y-%m-%d %H:%M:%S')
            } for note in user_notes]
        }

        # Log debug info server-side
        print("\nDebug Info for User:", current_user.username)
        print(f"Notes Count: {len(user_notes)}")
        for note in user_notes:
            print(f"Note ID: {note.id}, Title: {note.title}")

        return jsonify({
            'success': True,
            'debug_info': debug_info
        })
    except Exception as e:
        print(f"Debug Error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Debug information unavailable'
        }), 500
