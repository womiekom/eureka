const SUPABASE_URL = "https://fouhlldfdiiiafblqkac.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdWhsbGRmZGlpaWFmYmxxa2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzcyNTcsImV4cCI6MjA5OTk1MzI1N30.qcuk2gPafMt0Ur4pE4tcurYXOkO8Mv3oA5mDBX54tUY";

const supabaseClient = typeof supabase !== 'undefined' 
    ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registrationForm");
    const submitBtn = document.getElementById("submitBtn");
    const formCard = document.getElementById("formCard");
    const successCard = document.getElementById("successCard");
    const errorAlert = document.getElementById("submitErrorAlert");
    const errorAlertText = document.getElementById("errorAlertText");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideAllErrors();
        errorAlert.style.display = "none";

        const validation = validateForm();
        if (!validation.isValid) {
            showErrors(validation.errors);
            const firstErrorField = document.querySelector(".form-error[style*='display: block']");
            if (firstErrorField) {
                firstErrorField.parentNode.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }

        if (!supabaseClient) {
            showGlobalError("Koneksi ke database gagal. Pastikan Anda terhubung ke internet dan muat ulang halaman.");
            return;
        }

        setLoading(true);

        try {
            const interestCheckboxes = document.querySelectorAll("input[name='interests']:checked");
            const interestsArray = Array.from(interestCheckboxes).map(cb => cb.value);

            const payload = {
                full_name: document.getElementById("fullName").value.trim(),
                class: document.getElementById("studentClass").value,
                phone: document.getElementById("phone").value.trim(),
                experience: document.querySelector("input[name='experience']:checked").value,
                interests: interestsArray,
                motivation: document.getElementById("motivation").value.trim()
            };

            const { data, error } = await supabaseClient
                .from("registrations")
                .insert([payload]);

            if (error) throw error;

            formCard.style.display = "none";
            successCard.style.display = "block";
            window.scrollTo({ top: 0, behavior: "smooth" });

        } catch (err) {
            console.error(err);
            showGlobalError(`Gagal mengirim pendaftaran: ${err.message || "Kesalahan jaringan / database."}`);
        } finally {
            setLoading(false);
        }
    });

    function validateForm() {
        const errors = {};
        let isValid = true;

        const fullName = document.getElementById("fullName").value.trim();
        const studentClass = document.getElementById("studentClass").value;
        const phone = document.getElementById("phone").value.trim();
        const experience = document.querySelector("input[name='experience']:checked");
        const interests = document.querySelectorAll("input[name='interests']:checked");
        const motivation = document.getElementById("motivation").value.trim();

        if (!fullName) {
            errors.fullName = "Nama lengkap wajib diisi";
            isValid = false;
        }

        if (!studentClass) {
            errors.studentClass = "Kelas wajib dipilih";
            isValid = false;
        }

        if (!phone) {
            errors.phone = "Nomor WhatsApp wajib diisi";
            isValid = false;
        } else if (phone.length < 9 || !/^[0-9+\-\s]+$/.test(phone)) {
            errors.phone = "Masukkan nomor WhatsApp yang valid (minimal 9 digit)";
            isValid = false;
        }

        if (!experience) {
            errors.experience = "Wajib memilih tingkat pengalaman coding Anda";
            isValid = false;
        }

        if (interests.length === 0) {
            errors.interests = "Pilih minimal satu bidang minat Anda";
            isValid = false;
        }

        if (!motivation) {
            errors.motivation = "Motivasi bergabung wajib diisi";
            isValid = false;
        } else if (motivation.length < 15) {
            errors.motivation = "Motivasi terlalu singkat (minimal 15 karakter)";
            isValid = false;
        }

        return { isValid, errors };
    }

    function showErrors(errMap) {
        if (errMap.fullName) showFieldError("fullName", errMap.fullName);
        if (errMap.studentClass) showFieldError("studentClass", errMap.studentClass);
        if (errMap.phone) showFieldError("phone", errMap.phone);
        if (errMap.experience) {
            document.getElementById("experienceError").innerText = errMap.experience;
            document.getElementById("experienceError").style.display = "block";
        }
        if (errMap.interests) {
            document.getElementById("interestsError").innerText = errMap.interests;
            document.getElementById("interestsError").style.display = "block";
        }
        if (errMap.motivation) showFieldError("motivation", errMap.motivation);
    }

    function showFieldError(fieldId, message) {
        const errorDiv = document.getElementById(`${fieldId}Error`);
        const inputField = document.getElementById(fieldId);
        
        if (errorDiv) {
            errorDiv.innerText = message;
            errorDiv.style.display = "block";
        }
        if (inputField) {
            inputField.style.borderColor = "var(--color-red)";
        }
    }

    function hideAllErrors() {
        document.querySelectorAll(".form-error").forEach(div => {
            div.style.display = "none";
        });
        document.querySelectorAll("input, select, textarea").forEach(input => {
            input.style.borderColor = "var(--color-border)";
        });
    }

    function showGlobalError(message) {
        errorAlertText.innerText = message;
        errorAlert.style.display = "block";
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> <span>Memproses...</span>';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Kirim Pendaftaran</span>';
        }
    }
});
