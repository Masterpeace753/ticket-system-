import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_user_admin_only(client: AsyncClient, admin_token: str, user_token: str):
    # non-admin should get 403
    r = await client.post(
        "/api/users",
        json={"username": "newuser", "display_name": "New", "password": "pass1234"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert r.status_code == 403

    # admin should succeed
    r2 = await client.post(
        "/api/users",
        json={"username": "newuser2", "display_name": "New2", "password": "pass1234"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r2.status_code == 201
    assert r2.json()["username"] == "newuser2"


@pytest.mark.asyncio
async def test_list_users_authenticated(client: AsyncClient, user_token: str):
    r = await client.get(
        "/api/users", headers={"Authorization": f"Bearer {user_token}"}
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_cannot_deactivate_self(client: AsyncClient, admin_token: str, admin_user):
    r = await client.patch(
        f"/api/users/{admin_user.id}/deactivate",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 400
