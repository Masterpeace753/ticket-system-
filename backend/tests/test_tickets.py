import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_ticket(client: AsyncClient, user_token: str):
    response = await client.post(
        "/api/tickets",
        json={"title": "Test Ticket", "priority": "mittel"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Ticket"
    assert data["status"] == "neu"
    assert data["is_archived"] is False


@pytest.mark.asyncio
async def test_list_tickets(client: AsyncClient, user_token: str):
    response = await client.get(
        "/api/tickets", headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_status_to_erledigt_archives(client: AsyncClient, user_token: str):
    # create
    r = await client.post(
        "/api/tickets",
        json={"title": "To Archive"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    ticket_id = r.json()["id"]

    # set status erledigt
    r2 = await client.patch(
        f"/api/tickets/{ticket_id}/status",
        json={"status": "erledigt"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert r2.status_code == 200
    assert r2.json()["is_archived"] is True


@pytest.mark.asyncio
async def test_delete_requires_admin(client: AsyncClient, user_token: str):
    r = await client.post(
        "/api/tickets",
        json={"title": "Will be deleted"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    ticket_id = r.json()["id"]
    del_r = await client.delete(
        f"/api/tickets/{ticket_id}",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert del_r.status_code == 403


@pytest.mark.asyncio
async def test_unauthenticated_denied(client: AsyncClient):
    response = await client.get("/api/tickets")
    assert response.status_code == 403
