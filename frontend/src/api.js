const API_BASE_URL = "http://localhost:8080/api";

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, options);

    const text = await response.text();

    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
    }

    if (!response.ok) {
        const message =
            data?.message ||
            data?.error ||
            (typeof data === "string"
                ? data
                : "Request failed");

        throw new Error(message);
    }

    return data;
}


/* =========================
   API OBJECT
========================= */

export const api = {

    /* REGISTER */
    register(payload) {
        return request("/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
    },


    /* LOGIN */
    login(payload) {
        return request("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
    },


    /* SAVE VIDEO */
    saveVideo(payload) {
        return request("/videos/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
    },


    /* GENERATE FROM YOUTUBE URL */
    generateFromUrl(videoId) {
        return request(
            `/videos/${videoId}/generate-from-url`,
            {
                method: "POST"
            }
        );
    },


    /* GET USER VIDEOS */
    getUserVideos(email) {
        return request(
            `/videos/user/${encodeURIComponent(email)}`
        );
    },


    /* GET ONE VIDEO */
    getVideo(videoId) {
        return request(
            `/videos/${videoId}`
        );
    },


    /* AI CHAT */
    chat(videoId, question) {
        return request(
            `/videos/${videoId}/chat`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question: question
                })
            }
        );
    }
};