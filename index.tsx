
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import * as XLSX from 'xlsx';

// Initial default employee data
let employees: Employee[] = [
    { nik: '12345', nama: 'Budi Santoso', nomorKelompok: 'A1' },
    { nik: '67890', nama: 'Siti Aminah', nomorKelompok: 'B2' },
    { nik: '11223', nama: 'Rahmat Hidayat', nomorKelompok: 'A1' },
    { nik: '10001', nama: 'Dewi Lestari', nomorKelompok: 'C3' },
];

const adminCredentials = {
    username: 'admin',
    password: 'password123' // IMPORTANT: In a real app, never hardcode credentials.
};

const LOCAL_STORAGE_KEY = 'employeeAppData';

interface Employee {
    nik: string;
    nama: string;
    nomorKelompok: string;
}

let currentEmployee: Employee | null = null;
let isAdminLoggedIn = false;

function loadEmployeesFromLocalStorage() {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
        try {
            const parsedData = JSON.parse(storedData);
            // Lebih ketat memeriksa tipe dan keberadaan properti
            if (Array.isArray(parsedData) && parsedData.every(emp =>
                emp &&
                typeof emp.nik === 'string' &&
                typeof emp.nama === 'string' &&
                typeof emp.nomorKelompok === 'string' 
            )) {
                employees = parsedData;
            } else {
                 console.warn('Invalid data format in localStorage or some entries are incomplete. Using default employees for this session. Problematic data in localStorage will be overwritten on the next successful save.');
                 // employees tetap menggunakan data default awal yang didefinisikan di atas.
            }
        } catch (error) {
            console.error('Error parsing employees from localStorage. Using default employees for this session.', error);
            // employees tetap menggunakan data default awal.
        }
    } else {
        // Jika tidak ada data di Local Storage, simpan data default awal
        saveEmployeesToLocalStorage(); // Memastikan data default tersimpan saat pertama kali load jika LS kosong
    }
}

function saveEmployeesToLocalStorage() {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(employees));
    } catch (error) {
        console.error("Error saving employees to localStorage:", error);
        const fileUploadMessageEl = document.getElementById('file-upload-message');
        if (fileUploadMessageEl) {
            fileUploadMessageEl.textContent = 'Gagal menyimpan data. Penyimpanan browser mungkin penuh atau terjadi error.';
            fileUploadMessageEl.className = 'message-text error-text';
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    loadEmployeesFromLocalStorage();

    // Sections
    const employeeLoginSection = document.getElementById('employee-login-section');
    const adminLoginSection = document.getElementById('admin-login-section');
    const employeeDashboardSection = document.getElementById('employee-dashboard-section');
    const adminDashboardSection = document.getElementById('admin-dashboard-section');

    // Employee Login Elements
    const nikInput = document.getElementById('nik-input') as HTMLInputElement;
    const loginButton = document.getElementById('login-button');
    const errorMessageElement = document.getElementById('error-message');
    const showAdminLoginViewButton = document.getElementById('show-admin-login-view-button');

    // Admin Login Elements
    const adminUsernameInput = document.getElementById('admin-username') as HTMLInputElement;
    const adminPasswordInput = document.getElementById('admin-password') as HTMLInputElement;
    const adminLoginButton = document.getElementById('admin-login-button');
    const adminErrorMessageElement = document.getElementById('admin-error-message');
    const showEmployeeLoginViewButton = document.getElementById('show-employee-login-view-button');

    // Employee Dashboard Elements
    const dashboardNama = document.getElementById('dashboard-nama');
    const dashboardNik = document.getElementById('dashboard-nik');
    const dashboardNomorKelompok = document.getElementById('dashboard-nomorKelompok'); 
    const logoutButton = document.getElementById('logout-button');

    // Admin Dashboard Elements
    const totalKaryawanStat = document.getElementById('total-karyawan-stat');
    const totalKelompokStat = document.getElementById('total-kelompok-stat');
    const newNamaInput = document.getElementById('new-nama') as HTMLInputElement;
    const newNikInput = document.getElementById('new-nik') as HTMLInputElement;
    const newNomorKelompokInput = document.getElementById('new-nomor-kelompok') as HTMLInputElement; 
    const addEmployeeButton = document.getElementById('add-employee-button');
    const addEmployeeMessage = document.getElementById('add-employee-message');
    const adminLogoutButton = document.getElementById('admin-logout-button');

    // File Upload Elements
    const dataFileInput = document.getElementById('data-file-input') as HTMLInputElement;
    const uploadFileButton = document.getElementById('upload-file-button');
    const fileUploadMessage = document.getElementById('file-upload-message');


    function hideAllSections() {
        employeeLoginSection?.classList.add('hidden-section');
        adminLoginSection?.classList.add('hidden-section');
        employeeDashboardSection?.classList.add('hidden-section');
        adminDashboardSection?.classList.add('hidden-section');

        employeeLoginSection?.classList.remove('active-section');
        adminLoginSection?.classList.remove('active-section');
        employeeDashboardSection?.classList.remove('active-section');
        adminDashboardSection?.classList.remove('active-section');
    }

    function showEmployeeLoginView() {
        hideAllSections();
        if (employeeLoginSection && nikInput && errorMessageElement && adminErrorMessageElement) {
            employeeLoginSection.classList.remove('hidden-section');
            employeeLoginSection.classList.add('active-section');
            nikInput.value = '';
            if (errorMessageElement) errorMessageElement.textContent = '';
            if (adminErrorMessageElement) adminErrorMessageElement.textContent = '';
            currentEmployee = null;
            isAdminLoggedIn = false;
            nikInput.focus();
        }
    }

    function showAdminLoginView() {
        hideAllSections();
        if (adminLoginSection && adminUsernameInput && adminPasswordInput && adminErrorMessageElement && errorMessageElement) {
            adminLoginSection.classList.remove('hidden-section');
            adminLoginSection.classList.add('active-section');
            adminUsernameInput.value = '';
            adminPasswordInput.value = '';
            if (adminErrorMessageElement) adminErrorMessageElement.textContent = '';
            if (errorMessageElement) errorMessageElement.textContent = '';
            currentEmployee = null;
            isAdminLoggedIn = false;
            adminUsernameInput.focus();
        }
    }

    function showEmployeeDashboardView() {
        hideAllSections();
        if (employeeDashboardSection && currentEmployee && dashboardNama && dashboardNik && dashboardNomorKelompok) {
            employeeDashboardSection.classList.remove('hidden-section');
            employeeDashboardSection.classList.add('active-section');
            dashboardNama.textContent = currentEmployee.nama;
            dashboardNik.textContent = currentEmployee.nik;
            dashboardNomorKelompok.textContent = currentEmployee.nomorKelompok;
        }
    }

    function showAdminDashboardView() {
        hideAllSections();
        if (adminDashboardSection) {
            adminDashboardSection.classList.remove('hidden-section');
            adminDashboardSection.classList.add('active-section');
            updateAdminStats();
            clearAddEmployeeForm();
            clearFileUploadMessages();
        }
    }

    function handleEmployeeLogin() {
        if (nikInput && errorMessageElement) {
            const nik = nikInput.value.trim();
            if (!nik) {
                errorMessageElement.textContent = 'NIK tidak boleh kosong.';
                nikInput.focus();
                return;
            }
            const foundEmployee = employees.find(emp => emp.nik === nik);
            if (foundEmployee) {
                currentEmployee = foundEmployee;
                errorMessageElement.textContent = '';
                showEmployeeDashboardView();
            } else {
                errorMessageElement.textContent = 'NIK tidak valid. Coba masukan ulang.';
                nikInput.focus();
                nikInput.select();
            }
        }
    }

    function handleAdminLogin() {
        if (adminUsernameInput && adminPasswordInput && adminErrorMessageElement) {
            const username = adminUsernameInput.value.trim();
            const password = adminPasswordInput.value;

            if (!username || !password) {
                adminErrorMessageElement.textContent = 'Username dan Password tidak boleh kosong.';
                return;
            }

            if (username === adminCredentials.username && password === adminCredentials.password) {
                isAdminLoggedIn = true;
                adminErrorMessageElement.textContent = '';
                showAdminDashboardView();
            } else {
                adminErrorMessageElement.textContent = 'Username atau Password Admin salah.';
                isAdminLoggedIn = false;
                adminPasswordInput.value = '';
                adminPasswordInput.focus();
            }
        }
    }

    function updateAdminStats() {
        if (totalKaryawanStat && totalKelompokStat) {
            totalKaryawanStat.textContent = employees.length.toString();
            const uniqueKelompok = new Set(employees.map(emp => emp.nomorKelompok)); 
            totalKelompokStat.textContent = uniqueKelompok.size.toString();
        }
    }

    function clearAddEmployeeForm() {
        if (newNamaInput) newNamaInput.value = '';
        if (newNikInput) newNikInput.value = '';
        if (newNomorKelompokInput) newNomorKelompokInput.value = ''; 
        if (addEmployeeMessage) {
            addEmployeeMessage.textContent = '';
            addEmployeeMessage.className = 'message-text';
        }
    }

     function clearFileUploadMessages() {
        if (fileUploadMessage) {
            fileUploadMessage.textContent = '';
            fileUploadMessage.className = 'message-text';
        }
        if (dataFileInput) {
            dataFileInput.value = ''; // Reset file input
        }
    }

    function handleAddEmployee() {
        if (!newNamaInput || !newNikInput || !newNomorKelompokInput || !addEmployeeMessage) return;

        const nama = newNamaInput.value.trim();
        const nik = newNikInput.value.trim();
        const nomorKelompok = newNomorKelompokInput.value.trim(); 

        addEmployeeMessage.className = 'message-text'; // Reset class

        if (!nama || !nik || !nomorKelompok) { 
            addEmployeeMessage.textContent = 'Semua field harus diisi.';
            addEmployeeMessage.classList.add('error-text');
            return;
        }

        if (employees.some(emp => emp.nik === nik)) {
            addEmployeeMessage.textContent = 'NIK sudah terdaftar. Gunakan NIK lain.';
            addEmployeeMessage.classList.add('error-text');
            newNikInput.focus();
            newNikInput.select();
            return;
        }

        employees.push({ nama, nik, nomorKelompok }); 
        saveEmployeesToLocalStorage();
        updateAdminStats();
        addEmployeeMessage.textContent = 'Karyawan berhasil ditambahkan!';
        addEmployeeMessage.classList.add('success-text');

        setTimeout(() => {
            clearAddEmployeeForm();
            if (newNamaInput) newNamaInput.focus();
        }, 2000);
    }

    function processImportedData(dataRows: string[][]) {
        if (!fileUploadMessage) return;

        clearFileUploadMessages();

        if (dataRows.length < 2) {
            fileUploadMessage.textContent = 'File tidak valid atau kosong. Harus ada header dan minimal 1 baris data.';
            fileUploadMessage.className = 'message-text error-text';
            return;
        }

        const headers = dataRows[0].map(h => String(h ?? '').toLowerCase().trim());

        const namaIndex = headers.indexOf('nama');
        const nikIndex = headers.indexOf('nik');
        const nomorKelompokIndex = headers.indexOf('nomorkelompok'); // Header file diharapkan 'nomorkelompok'

        if (namaIndex === -1 || nikIndex === -1 || nomorKelompokIndex === -1) {
            fileUploadMessage.textContent = 'Header file tidak valid. Pastikan terdapat kolom "nama", "nik", dan "nomorkelompok".';
            fileUploadMessage.className = 'message-text error-text';
            return;
        }

        let addedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        const newEmployeesBatch: Employee[] = [];

        for (let i = 1; i < dataRows.length; i++) {
            const row = dataRows[i];
            if (!row || row.length < Math.max(namaIndex, nikIndex, nomorKelompokIndex) + 1) {
                console.warn(`Baris ${i+1} tidak memiliki cukup kolom atau baris tidak valid: ${row?.join(',')}`);
                errorCount++;
                continue;
            }

            const nama = String(row[namaIndex] ?? '').trim();
            const nik = String(row[nikIndex] ?? '').trim();
            const nomorKelompok = String(row[nomorKelompokIndex] ?? '').trim(); 


            if (!nama || !nik || !nomorKelompok) { 
                console.warn(`Baris ${i+1} memiliki data yang hilang: ${row.join(',')}`);
                errorCount++;
                continue;
            }

            if (employees.some(emp => emp.nik === nik) || newEmployeesBatch.some(emp => emp.nik === nik)) {
                console.warn(`NIK ${nik} pada baris ${i+1} sudah ada atau duplikat dalam file.`);
                skippedCount++;
                continue;
            }
            newEmployeesBatch.push({ nama, nik, nomorKelompok }); 
            addedCount++;
        }

        if (newEmployeesBatch.length > 0) {
            employees.push(...newEmployeesBatch);
            saveEmployeesToLocalStorage();
            updateAdminStats();
        }

        let message = `Proses File Selesai. Karyawan ditambahkan: ${addedCount}.`;
        if (skippedCount > 0) message += ` Baris dilewati (NIK duplikat): ${skippedCount}.`;
        if (errorCount > 0) message += ` Baris error (data tidak lengkap/format salah): ${errorCount}.`;

        fileUploadMessage.textContent = message;
        fileUploadMessage.className = (addedCount > 0) ? 'message-text success-text' : 'message-text error-text';

        if (errorCount > 0 && addedCount === 0 && skippedCount === 0) {
             fileUploadMessage.className = 'message-text error-text';
        }


        if (dataFileInput) dataFileInput.value = '';
    }

    function handleFileUpload() {
        if (!dataFileInput || !dataFileInput.files || dataFileInput.files.length === 0) {
            if (fileUploadMessage) {
                clearFileUploadMessages();
                fileUploadMessage.textContent = 'Silakan pilih file terlebih dahulu.';
                fileUploadMessage.className = 'message-text error-text';
            }
            return;
        }

        const file = dataFileInput.files[0];
        const fileName = file.name.toLowerCase();

        clearFileUploadMessages();

        const reader = new FileReader();

        reader.onload = (event) => {
            const result = event.target?.result;
            if (!result) {
                if (fileUploadMessage) {
                    fileUploadMessage.textContent = 'Tidak dapat membaca isi file.';
                    fileUploadMessage.className = 'message-text error-text';
                }
                return;
            }

            if (fileName.endsWith('.csv')) {
                const lines = (result as string).split(/\r\n|\n/);
                const dataArray: string[][] = lines.map(line => {
                    // Handle CSVs that might have quoted fields containing commas
                    const regex = /(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^\",]+))/g;
                    let match;
                    const fields = [];
                    while ((match = regex.exec(line)) !== null) {
                        // If it's a quoted field, take group 1 (and unescape double quotes)
                        // Otherwise, take group 2
                        fields.push(match[1] ? match[1].replace(/\"\"/g, '\"') : match[2]);
                    }
                    return fields;
                }).filter(row => row.some(cell => cell && cell.trim() !== '')); // Ensure cell is not null before trim
                processImportedData(dataArray);

            } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
                try {
                    const workbook = XLSX.read(result as ArrayBuffer, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, raw: false });

                    const stringData: string[][] = data.map(row =>
                        row.map(cell => String(cell === null || cell === undefined ? '' : cell).trim())
                    );
                    processImportedData(stringData);

                } catch (e) {
                    console.error("Error processing Excel file:", e);
                    if (fileUploadMessage) {
                        fileUploadMessage.textContent = 'Gagal memproses file Excel. Pastikan formatnya benar dan tidak terproteksi.';
                        fileUploadMessage.className = 'message-text error-text';
                    }
                }
            } else {
                 if (fileUploadMessage) {
                    fileUploadMessage.textContent = 'Format file tidak didukung. Harap unggah file .csv, .xls, atau .xlsx';
                    fileUploadMessage.className = 'message-text error-text';
                }
            }
        };

        reader.onerror = () => {
            if (fileUploadMessage) {
                fileUploadMessage.textContent = 'Gagal membaca file.';
                fileUploadMessage.className = 'message-text error-text';
            }
        };

        if (fileName.endsWith('.csv')) {
            reader.readAsText(file);
        } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
            reader.readAsArrayBuffer(file);
        } else {
            if (fileUploadMessage) {
                fileUploadMessage.textContent = 'Format file tidak didukung. Harap unggah file .csv, .xls, atau .xlsx';
                fileUploadMessage.className = 'message-text error-text';
            }
            if (dataFileInput) dataFileInput.value = '';
            return;
        }
    }


    // Event Listeners for Employee Login
    if (loginButton && nikInput) {
        loginButton.addEventListener('click', handleEmployeeLogin);
        nikInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') handleEmployeeLogin();
        });
    }
    if (logoutButton) {
        logoutButton.addEventListener('click', showEmployeeLoginView);
    }
    if (showAdminLoginViewButton) {
        showAdminLoginViewButton.addEventListener('click', showAdminLoginView);
    }

    // Event Listeners for Admin Login
    if (adminLoginButton && adminUsernameInput && adminPasswordInput) {
        adminLoginButton.addEventListener('click', handleAdminLogin);
        adminPasswordInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') handleAdminLogin();
        });
         adminUsernameInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') handleAdminLogin();
        });
    }
    if (showEmployeeLoginViewButton) {
        showEmployeeLoginViewButton.addEventListener('click', showEmployeeLoginView);
    }
    if (adminLogoutButton) {
        adminLogoutButton.addEventListener('click', showEmployeeLoginView);
    }

    // Event Listeners for Admin Dashboard
    if (addEmployeeButton && newNamaInput && newNikInput && newNomorKelompokInput) { 
        addEmployeeButton.addEventListener('click', handleAddEmployee);

        const addEmployeeOnEnter = (event: KeyboardEvent) => {
            if (event.key === 'Enter') handleAddEmployee();
        };
        newNamaInput.addEventListener('keypress', addEmployeeOnEnter);
        newNikInput.addEventListener('keypress', addEmployeeOnEnter);
        newNomorKelompokInput.addEventListener('keypress', addEmployeeOnEnter); 
    }
    if (uploadFileButton) {
        uploadFileButton.addEventListener('click', handleFileUpload);
    }

    // Initial state
    showEmployeeLoginView();
});
