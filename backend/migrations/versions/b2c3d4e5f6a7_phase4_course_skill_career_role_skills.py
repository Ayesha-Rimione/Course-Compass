"""Phase 4 course skill mappings and career role skills

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-08-24 21:24:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create course_skill_mappings table
    op.create_table(
        'course_skill_mappings',
        sa.Column('id', sa.String(36), primary_key=True, nullable=False),
        sa.Column('course_id', sa.String(36), sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False),
        sa.Column('skill_id', sa.String(36), sa.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False),
        sa.Column('relevance_weight', sa.Float(), nullable=False, server_default='0.5'),
        sa.Column('source', sa.String(50), nullable=False, server_default='academic_mapping'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint('course_id', 'skill_id', name='uq_course_skill'),
    )
    op.create_index('ix_course_skill_mappings_course_id', 'course_skill_mappings', ['course_id'])
    op.create_index('ix_course_skill_mappings_skill_id', 'course_skill_mappings', ['skill_id'])

    # Create career_role_skills table
    op.create_table(
        'career_role_skills',
        sa.Column('id', sa.String(36), primary_key=True, nullable=False),
        sa.Column('career_role_id', sa.String(36), sa.ForeignKey('career_roles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('skill_id', sa.String(36), sa.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False),
        sa.Column('importance', sa.Integer(), nullable=False, server_default='3'),
        sa.Column('minimum_rating', sa.Integer(), nullable=False, server_default='3'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint('career_role_id', 'skill_id', name='uq_career_role_skill'),
    )
    op.create_index('ix_career_role_skills_career_role_id', 'career_role_skills', ['career_role_id'])
    op.create_index('ix_career_role_skills_skill_id', 'career_role_skills', ['skill_id'])


def downgrade() -> None:
    op.drop_index('ix_career_role_skills_skill_id', table_name='career_role_skills')
    op.drop_index('ix_career_role_skills_career_role_id', table_name='career_role_skills')
    op.drop_table('career_role_skills')

    op.drop_index('ix_course_skill_mappings_skill_id', table_name='course_skill_mappings')
    op.drop_index('ix_course_skill_mappings_course_id', table_name='course_skill_mappings')
    op.drop_table('course_skill_mappings')
