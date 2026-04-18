import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, admin_user):
    response = await client.post(
        "/api/auth/login", json={"username": "testadmin", "password": "adminpass"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, admin_user):
    response = await client.post(
        "/api/auth/login", json={"username": "testadmin", "password": "wrongpass"}
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_unknown_user(client: AsyncClient):
    response = await client.post(
        "/api/auth/login", json={"username": "nobody", "password": "x"}
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me(client: AsyncClient, admin_token: str):
    response = await client.get(
        "/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert response.json()["username"] == "testadmin"


@pytest.mark.asyncio
async def test_me_unauthenticated(client: AsyncClient):
    response = await client.get("/api/auth/me")
    assert response.status_code == 403
