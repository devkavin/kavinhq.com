from fastapi import Request


def get_db(request: Request):
    factory = request.app.state.session_factory
    session = factory()
    try:
        yield session
    finally:
        session.close()
