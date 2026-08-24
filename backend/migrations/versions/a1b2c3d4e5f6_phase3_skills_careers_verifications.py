"""Phase 3 skills careers verifications

Revision ID: a1b2c3d4e5f6
Revises: 5e6ed08fa261
Create Date: 2026-08-24 21:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '5e6ed08fa261'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create skills table
    op.create_table(
        'skills',
        sa.Column('id', sa.String(36), primary_key=True, nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('category', sa.String(100), nullable=False, server_default='Other'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_skills_name', 'skills', ['name'], unique=True)

    # Create career_roles table
    op.create_table(
        'career_roles',
        sa.Column('id', sa.String(36), primary_key=True, nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_career_roles_name', 'career_roles', ['name'], unique=True)

    # Create student_skills table
    op.create_table(
        'student_skills',
        sa.Column('id', sa.String(36), primary_key=True, nullable=False),
        sa.Column('student_profile_id', sa.String(36), sa.ForeignKey('student_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('skill_id', sa.String(36), sa.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False),
        sa.Column('self_rating', sa.Integer(), nullable=False, server_default='1'),
        sa.Column(
            'verification_status',
            sa.Enum('NOT_VERIFIED', 'QUIZ_AVAILABLE', 'QUIZ_IN_PROGRESS', 'VERIFIED', name='verificationstatus'),
            nullable=False,
            server_default='NOT_VERIFIED'
        ),
        sa.Column('verified_rating', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint('student_profile_id', 'skill_id', name='uq_student_skill'),
    )
    op.create_index('ix_student_skills_student_profile_id', 'student_skills', ['student_profile_id'])
    op.create_index('ix_student_skills_skill_id', 'student_skills', ['skill_id'])

    # Create student_career_interests table
    op.create_table(
        'student_career_interests',
        sa.Column('id', sa.String(36), primary_key=True, nullable=False),
        sa.Column('student_profile_id', sa.String(36), sa.ForeignKey('student_profiles.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('career_role_id', sa.String(36), sa.ForeignKey('career_roles.id', ondelete='SET NULL'), nullable=True),
        sa.Column('is_still_exploring', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_student_career_interests_student_profile_id', 'student_career_interests', ['student_profile_id'])

    # Create skill_verifications table
    op.create_table(
        'skill_verifications',
        sa.Column('id', sa.String(36), primary_key=True, nullable=False),
        sa.Column('student_profile_id', sa.String(36), sa.ForeignKey('student_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('skill_id', sa.String(36), sa.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False),
        sa.Column('attempt_number', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('score', sa.Float(), nullable=True),
        sa.Column('max_score', sa.Float(), nullable=True),
        sa.Column('percentage', sa.Float(), nullable=True),
        sa.Column(
            'status',
            sa.Enum('IN_PROGRESS', 'PASSED', 'FAILED', name='quizstatus'),
            nullable=False,
            server_default='IN_PROGRESS'
        ),
        sa.Column('verified_rating', sa.Integer(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_skill_verifications_student_profile_id', 'skill_verifications', ['student_profile_id'])
    op.create_index('ix_skill_verifications_skill_id', 'skill_verifications', ['skill_id'])


def downgrade() -> None:
    op.drop_index('ix_skill_verifications_skill_id', table_name='skill_verifications')
    op.drop_index('ix_skill_verifications_student_profile_id', table_name='skill_verifications')
    op.drop_table('skill_verifications')

    op.drop_index('ix_student_career_interests_student_profile_id', table_name='student_career_interests')
    op.drop_table('student_career_interests')

    op.drop_index('ix_student_skills_skill_id', table_name='student_skills')
    op.drop_index('ix_student_skills_student_profile_id', table_name='student_skills')
    op.drop_table('student_skills')

    op.drop_index('ix_career_roles_name', table_name='career_roles')
    op.drop_table('career_roles')

    op.drop_index('ix_skills_name', table_name='skills')
    op.drop_table('skills')
