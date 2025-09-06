from fastapi.requests import TestClient
from main import router

client = TestClient(router)

def test_get_ticket():
    response = client.get("/tickets/")
    assert response.status_code == 404
    assert response.json()['detail'] == 'Заявка не найдена'
    
def test_update_ticket_not_found_for_adm():
    headers = {'Automatization': ''}
    response = client.patch("/tickets/", json={"status": "closed"}, headers=headers)
    assert response.status_code == 404 or response.status_code == 403
    
def test_update_ticket_for_non_adm():
    headers = {"Authorization": ""}
    response = client.patch("/tickets/", json={"status": "closed"}, headers=headers)
    assert response.status_code == 403
    assert response.json()['detail'] == "Only admin can update"