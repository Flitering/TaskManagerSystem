import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

# Подтягиваем настройки логирования из alembic.ini
config = context.config
fileConfig(config.config_file_name)

# ========= ВАЖНО: Импортируем Base откуда-то из приложения ========
# Предположим, что в app.models мы имеем:
#   from app.database import Base
# И/или что Base.metadata объявлен там же.
# Если у вас Base лежит прямо в app.models, делайте:
from app.models import Base

# Если по какой-то причине Base лежит в app.database, то:
# from app.database import Base

# Это нужно для автогенерации миграций:
target_metadata = Base.metadata

# Здесь можно прочитать строку подключения из alembic.ini:
# (по умолчанию Alembic берет ее из sqlalchemy.url, указанного в alembic.ini)
# или задать programmatically, например так:
# config.set_main_option('sqlalchemy.url', "postgresql://postgres:admin@localhost:5432/taskmanager")


def run_migrations_offline():
    """Run migrations in 'offline' mode.

    In this mode, we configure the context with just a URL
    and not an Engine. ...
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        # сравнивать типы колонок, чтобы Alembic мог увидеть изменения
        compare_type=True,
        # сравнивать server_default
        compare_server_default=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine ...
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
