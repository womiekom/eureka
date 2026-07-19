const SUPABASE_URL = "https://fouhlldfdiiiafblqkac.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdWhsbGRmZGlpaWFmYmxxa2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzcyNTcsImV4cCI6MjA5OTk1MzI1N30.qcuk2gPafMt0Ur4pE4tcurYXOkO8Mv3oA5mDBX54tUY";

let supabaseAdmin = null;
let allRegistrations = [];

document.addEventListener("DOMContentLoaded", () => {
    const loginCard = document.getElementById("loginCard");
    const dashboardContent = document.getElementById("dashboardContent");
    const loginForm = document.getElementById("loginForm");
    const loginErrorAlert = document.getElementById("loginErrorAlert");
    const logoutBtn = document.getElementById("logoutBtn");

    const searchFilter = document.getElementById("searchFilter");
    const classFilter = document.getElementById("classFilter");

    const savedAuth = sessionStorage.getItem("eureka_admin_session");
    if (savedAuth === "eureka!") {
        initializeDashboard("eureka!");
    }

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        loginErrorAlert.style.display = "none";

        const username = document.getElementById("adminUsername").value.trim();
        const password = document.getElementById("adminPassword").value.trim();

        if (username === "eurekaadmin" && password === "eureka!") {
            sessionStorage.setItem("eureka_admin_session", "eureka!");
            initializeDashboard("eureka!");
        } else {
            loginErrorAlert.style.display = "block";
        }
    });

    logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("eureka_admin_session");
        window.location.reload();
    });

    searchFilter.addEventListener("input", filterAndRenderTable);
    classFilter.addEventListener("change", filterAndRenderTable);

    function initializeDashboard(adminPassword) {
        loginCard.style.display = "none";
        dashboardContent.style.display = "block";
        logoutBtn.style.display = "block";

        if (typeof supabase !== "undefined") {
            supabaseAdmin = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                global: {
                    headers: {
                        "x-admin-password": adminPassword
                    }
                }
            });
            fetchData();
        } else {
            showErrorState("Supabase SDK failed to load. Please reload the page.");
        }
    }

    async function fetchData() {
        if (!supabaseAdmin) return;
        showLoadingState();

        try {
            const { data, error } = await supabaseAdmin
                .from("registrations")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            allRegistrations = data || [];
            updateStats();
            filterAndRenderTable();
        } catch (err) {
            console.error(err);
            showErrorState(`Gagal memuat data: ${err.message}`);
        }
    }

    function updateStats() {
        document.getElementById("statTotal").innerText = allRegistrations.length;
    }

    function filterAndRenderTable() {
        const searchVal = searchFilter.value.toLowerCase().trim();
        const classVal = classFilter.value;

        const filtered = allRegistrations.filter(reg => {
            const matchesSearch = reg.full_name.toLowerCase().includes(searchVal);
            const matchesClass = classVal === "" || reg.class === classVal;
            return matchesSearch && matchesClass;
        });

        renderTable(filtered);
    }

    function renderTable(data) {
        const tbody = document.getElementById("registrationsBody");
        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-folder-open"></i>
                        <p>Tidak ada data pendaftaran yang cocok dengan filter.</p>
                    </td>
                </tr>
            `;
            return;
        }

        data.forEach(reg => {
            const tr = document.createElement("tr");

            const formattedDate = reg.created_at 
                ? new Date(reg.created_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })
                : "-";

            const interestsText = Array.isArray(reg.interests) 
                ? reg.interests.map(i => `<code style="background:#f1f5f9; padding:2px 4px; border-radius:3px; font-size:0.75rem; margin-right:4px; display:inline-block; margin-bottom:4px;">${i}</code>`).join("")
                : reg.interests || "-";

            tr.innerHTML = `
                <td>
                    <div style="font-weight: 600;">${escapeHtml(reg.full_name)}</div>
                    <div style="font-size: 0.72rem; color: var(--color-text-secondary); margin-top: 4px;">Terdaftar: ${formattedDate}</div>
                </td>
                <td><code style="font-weight: 600;">${escapeHtml(reg.class)}</code></td>
                <td>
                    <a href="https://wa.me/${cleanPhone(reg.phone)}" target="_blank" style="color: var(--color-accent); font-weight: 500;">
                        <i class="fab fa-whatsapp"></i> ${escapeHtml(reg.phone)}
                    </a>
                </td>
                <td><span style="font-size: 0.8rem; font-family: var(--font-mono);">${escapeHtml(reg.experience)}</span></td>
                <td><div style="max-height: 80px; overflow-y: auto;">${interestsText}</div></td>
                <td>
                    <div style="max-height: 80px; overflow-y: auto; font-size: 0.8rem; line-height: 1.5; color: var(--color-text-secondary);">
                        ${escapeHtml(reg.motivation)}
                    </div>
                </td>
            `;

            tbody.appendChild(tr);
        });
    }

    function showLoadingState() {
        const tbody = document.getElementById("registrationsBody");
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-circle-notch fa-spin" style="color: var(--color-accent);"></i>
                    <p>Memuat data pendaftaran...</p>
                </td>
            </tr>
        `;
    }

    function showErrorState(message) {
        const tbody = document.getElementById("registrationsBody");
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state" style="color: var(--color-red);">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${escapeHtml(message)}</p>
                </td>
            </tr>
        `;
    }

    function cleanPhone(num) {
        let cleaned = num.replace(/[^0-9]/g, "");
        if (cleaned.startsWith("0")) {
            cleaned = "62" + cleaned.slice(1);
        }
        return cleaned;
    }

    function escapeHtml(str) {
        if (!str) return "";
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
