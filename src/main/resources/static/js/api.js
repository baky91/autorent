const BASE_URL = "http://localhost:8080";

/* VEHICLES */
export async function getAllVehicles() {
    return await getData("/api/vehicles");
}

export async function getVehicleById(id) {
    return await getData("/api/vehicles/" + id);
}

/* RESERVATIONS */
export async function getMyReservations(auth_token=null) {
    if (!auth_token) {
        throw new Error("No token provided");
    }
    return await getData("/api/reservations/me", auth_token);
}

export async function createReservation(vehicleId, startDate, endDate, auth_token=null) {
    if (!auth_token) {
        throw new Error("No token provided");
    }
    const payload = {
        vehicle_id: vehicleId,
        startDate: startDate,
        endDate: endDate,
    }

    return await postData("/api/reservations/me", payload, auth_token);
}

export async function cancelReservation(reservationId, auth_token=null) {
    if (!auth_token) {
        throw new Error("No token provided");
    }

    return await getData(`/api/reservations/${reservationId}`, auth_token);
}

/* USERS & AUTH */
export async function registerUser(username, password) {
    const payload = {
        username: username,
        password: password
    };
    return await postData("/api/auth/register", payload);
}

export async function loginUser(username, password) {
    const payload = {
        username: username,
        password: password
    };
    return await postData("/api/auth/login", payload);
}

export async function logoutUser(auth_token = null) {
    // Appel optionnel au backend pour signifier la déconnexion
    if (auth_token) {
        try {
            await fetch(`${BASE_URL}/api/auth/logout`, {
                method: "POST",
                headers: { "Authorization": auth_token }
            });
        } catch(e) {
            console.warn("Erreur lors du logout backend", e);
        }
    }
    
    // Le plus important en JWT : on efface le token du navigateur
    localStorage.removeItem("jwt_token");
}

/**************************************/
/*         FONCTIONS DE BASES         */
/**************************************/

export async function getData(endpoint, authorization_token=null) {
    try {
        let headers = {}
        if (authorization_token) {
            headers["Authorization"] = authorization_token
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            headers: headers,
        })

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Erreur lors de la récupération des données:", error)
        return null
    }
}

export async function postData(endpoint, payload, authorization_token=null) {
    try {
        let headers = {"Content-Type": "application/json"}
        if (authorization_token) {
            headers["Authorization"] = authorization_token
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Erreur lors de l'envoi des données:", error)
        return null
    }
}

export async function putData(endpoint, payload, authorization_token=null) {
    try {
        let headers = {"Content-Type": "application/json"}
        if (authorization_token) {
            headers["Authorization"] = authorization_token
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "PUT",
            headers: headers,
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Erreur lors de la modification des données:", error)
        return null
    }
}

export async function deleteData(endpoint, authorization_token=null) {
    try {
        let headers = {}
        if (authorization_token) {
            headers["Authorization"] = authorization_token
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "DELETE",
            headers: headers,
        })

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Erreur lors de la suppression des données:", error)
        return null
    }
}
