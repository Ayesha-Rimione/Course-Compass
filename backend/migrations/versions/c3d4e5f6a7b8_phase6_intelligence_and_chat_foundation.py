"""Phase 6 intelligence and chat foundation

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-08-24 22:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add columns to career_roles
    with op.batch_alter_table('career_roles') as batch_op:
        batch_op.add_column(sa.Column('category', sa.String(100), server_default='Software Engineering', nullable=True))
        batch_op.add_column(sa.Column('target_readiness_level', sa.Integer(), server_default='80', nullable=True))

    # 2. Add column to course_skill_mappings
    with op.batch_alter_table('course_skill_mappings') as batch_op:
        batch_op.add_column(sa.Column('contribution_level', sa.String(30), server_default='INTERMEDIATE', nullable=False))

    # 3. Add column to career_role_skills
    with op.batch_alter_table('career_role_skills') as batch_op:
        batch_op.add_column(sa.Column('importance_level', sa.String(30), server_default='IMPORTANT', nullable=False))

    # 4. Create learning_resources table
    op.create_table(
        'learning_resources',
        sa.Column('id', sa.String(36), primary_key=True, nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('provider', sa.String(100), nullable=False),
        sa.Column('url', sa.Text(), nullable=False),
        sa.Column('resource_type', sa.String(50), server_default='DOCUMENTATION', nullable=False),
        sa.Column('difficulty', sa.String(50), server_default='Beginner', nullable=False),
        sa.Column('estimated_hours', sa.Integer(), nullable=True),
        sa.Column('is_free', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('price', sa.String(50), nullable=True),
        sa.Column('category', sa.String(100), nullable=True),
        sa.Column('skill_id', sa.String(36), sa.ForeignKey('skills.id', ondelete='SET NULL'), nullable=True),
        sa.Column('career_role_id', sa.String(36), sa.ForeignKey('career_roles.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_learning_resources_title', 'learning_resources', ['title'])
    op.create_index('ix_learning_resources_provider', 'learning_resources', ['provider'])
    op.create_index('ix_learning_resources_skill_id', 'learning_resources', ['skill_id'])
    op.create_index('ix_learning_resources_career_role_id', 'learning_resources', ['career_role_id'])

    # 5. Create project_recommendations table
    op.create_table(
        'project_recommendations',
        sa.Column('id', sa.String(36), primary_key=True, nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('difficulty', sa.String(50), server_default='Intermediate', nullable=False),
        sa.Column('estimated_hours', sa.Integer(), nullable=True),
        sa.Column('project_type', sa.String(50), server_default='Web App', nullable=True),
        sa.Column('skills_demonstrated', sa.Text(), nullable=True),
        sa.Column('technologies', sa.Text(), nullable=True),
        sa.Column('recommended_for_gap_level', sa.String(50), server_default='DEVELOPING', nullable=True),
        sa.Column('is_team', sa.Boolean(), server_default='0', nullable=False),
        sa.Column('career_role_id', sa.String(36), sa.ForeignKey('career_roles.id', ondelete='SET NULL'), nullable=True),
        sa.Column('github_starter_url', sa.Text(), nullable=True),
        sa.Column('live_demo_url', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_project_recommendations_title', 'project_recommendations', ['title'])
    op.create_index('ix_project_recommendations_career_role_id', 'project_recommendations', ['career_role_id'])

    # 6. Create certifications table
    op.create_table(
        'certifications',
        sa.Column('id', sa.String(36), primary_key=True, nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('provider', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('url', sa.Text(), nullable=False),
        sa.Column('estimated_hours', sa.Integer(), nullable=True),
        sa.Column('difficulty', sa.String(50), server_default='Intermediate', nullable=False),
        sa.Column('skills_learned', sa.Text(), nullable=True),
        sa.Column('career_role_id', sa.String(36), sa.ForeignKey('career_roles.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_certifications_name', 'certifications', ['name'])
    op.create_index('ix_certifications_provider', 'certifications', ['provider'])
    op.create_index('ix_certifications_career_role_id', 'certifications', ['career_role_id'])

    # 7. Create job_listings table
    op.create_table(
        'job_listings',
        sa.Column('id', sa.String(36), primary_key=True, nullable=False),
        sa.Column('role', sa.String(255), nullable=False),
        sa.Column('company_name', sa.String(255), nullable=False),
        sa.Column('location', sa.String(100), nullable=False),
        sa.Column('employment_type', sa.String(50), server_default='Full-time', nullable=False),
        sa.Column('experience_level', sa.String(50), server_default='Junior', nullable=False),
        sa.Column('salary_min', sa.Integer(), nullable=True),
        sa.Column('salary_max', sa.Integer(), nullable=True),
        sa.Column('currency', sa.String(10), server_default='BDT', nullable=False),
        sa.Column('salary_formatted', sa.String(100), nullable=True),
        sa.Column('required_skills', sa.Text(), nullable=True),
        sa.Column('source_url', sa.Text(), nullable=True),
        sa.Column('posted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_sample', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('career_role_id', sa.String(36), sa.ForeignKey('career_roles.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_job_listings_role', 'job_listings', ['role'])
    op.create_index('ix_job_listings_company_name', 'job_listings', ['company_name'])
    op.create_index('ix_job_listings_career_role_id', 'job_listings', ['career_role_id'])

    # 8. Create chat_conversations table
    op.create_table(
        'chat_conversations',
        sa.Column('id', sa.String(36), primary_key=True, nullable=False),
        sa.Column('student_profile_id', sa.String(36), sa.ForeignKey('student_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), server_default='New Advising Session', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_chat_conversations_student_profile_id', 'chat_conversations', ['student_profile_id'])

    # 9. Create chat_messages table
    op.create_table(
        'chat_messages',
        sa.Column('id', sa.String(36), primary_key=True, nullable=False),
        sa.Column('conversation_id', sa.String(36), sa.ForeignKey('chat_conversations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_chat_messages_conversation_id', 'chat_messages', ['conversation_id'])


def downgrade() -> None:
    op.drop_table('chat_messages')
    op.drop_table('chat_conversations')
    op.drop_table('job_listings')
    op.drop_table('certifications')
    op.drop_table('project_recommendations')
    op.drop_table('learning_resources')

    with op.batch_alter_table('career_role_skills') as batch_op:
        batch_op.drop_column('importance_level')

    with op.batch_alter_table('course_skill_mappings') as batch_op:
        batch_op.drop_column('contribution_level')

    with op.batch_alter_table('career_roles') as batch_op:
        batch_op.drop_column('target_readiness_level')
        batch_op.drop_column('category')
