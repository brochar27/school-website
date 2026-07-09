const PAGE_SIZE = 24;
const DATA_URL = "data/driving-students.json";

const state = {
  students: [],
  filtered: [],
  page: 1,
  search: "",
  status: "",
  instructor: "",
  license: "",
  sort: "name-asc",
};

const els = {
  heroStats: document.getElementById("hero-stats"),
  statsBar: document.getElementById("stats-bar"),
  loading: document.getElementById("loading-state"),
  grid: document.getElementById("student-grid"),
  pagination: document.getElementById("pagination"),
  resultCount: document.getElementById("result-count"),
  search: document.getElementById("search-input"),
  filterStatus: document.getElementById("filter-status"),
  filterInstructor: document.getElementById("filter-instructor"),
  filterLicense: document.getElementById("filter-license"),
  sortBy: document.getElementById("sort-by"),
  prevPage: document.getElementById("prev-page"),
  nextPage: document.getElementById("next-page"),
  pageInfo: document.getElementById("page-info"),
  instructorGrid: document.getElementById("instructor-grid"),
  modal: document.getElementById("student-modal"),
  modalContent: document.getElementById("modal-content"),
  modalClose: document.getElementById("modal-close"),
};

function badgeClass(status) {
  const key = status.toLowerCase();
  if (key === "active") return "active";
  if (key === "completed") return "completed";
  if (key === "pending test") return "pending";
  if (key === "on hold" || key === "waitlisted") return "hold";
  return "pending";
}

function fullName(student) {
  return `${student.first_name} ${student.last_name}`;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function computeStats(students) {
  const active = students.filter((s) => s.status === "Active").length;
  const completed = students.filter((s) => s.status === "Completed").length;
  const pending = students.filter((s) => s.status === "Pending Test").length;
  const totalHours = students.reduce((sum, s) => sum + s.hours_driven, 0);
  const avgHours = totalHours / students.length;
  const passed = students.filter((s) => s.road_test_passed === true).length;

  return {
    total: students.length,
    active,
    completed,
    pending,
    avgHours,
    passed,
  };
}

function renderHeroStats(stats) {
  els.heroStats.innerHTML = `
    <div class="preview-stat"><strong>${stats.total.toLocaleString()}</strong><span>Total students</span></div>
    <div class="preview-stat"><strong>${stats.active.toLocaleString()}</strong><span>Currently active</span></div>
    <div class="preview-stat"><strong>${stats.completed.toLocaleString()}</strong><span>Program completed</span></div>
    <div class="preview-stat"><strong>${stats.avgHours.toFixed(1)}</strong><span>Avg hours driven</span></div>
  `;
}

function renderStatsBar(stats) {
  els.statsBar.innerHTML = `
    <article class="stat-card accent"><strong>${stats.total.toLocaleString()}</strong><span>Enrolled students</span></article>
    <article class="stat-card"><strong>${stats.active.toLocaleString()}</strong><span>Active in training</span></article>
    <article class="stat-card"><strong>${stats.completed.toLocaleString()}</strong><span>Completed program</span></article>
    <article class="stat-card"><strong>${stats.pending.toLocaleString()}</strong><span>Pending road test</span></article>
    <article class="stat-card"><strong>${stats.passed.toLocaleString()}</strong><span>Tests passed</span></article>
  `;
}

function renderInstructors(students) {
  const counts = students.reduce((map, student) => {
    map.set(student.instructor, (map.get(student.instructor) || 0) + 1);
    return map;
  }, new Map());

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const max = sorted[0]?.[1] || 1;

  els.instructorGrid.innerHTML = sorted
    .map(
      ([name, count]) => `
      <article class="instructor-card">
        <strong>${name}</strong>
        <span>${count.toLocaleString()} students assigned</span>
        <div class="instructor-bar" aria-hidden="true">
          <div style="width:${((count / max) * 100).toFixed(1)}%"></div>
        </div>
      </article>
    `
    )
    .join("");
}

function populateFilters(students) {
  const unique = (key) => [...new Set(students.map((s) => s[key]))].sort();

  for (const value of unique("status")) {
    els.filterStatus.add(new Option(value, value));
  }
  for (const value of unique("instructor")) {
    els.filterInstructor.add(new Option(value, value));
  }
  for (const value of unique("license_type")) {
    els.filterLicense.add(new Option(value, value));
  }
}

function applyFilters() {
  const q = state.search.trim().toLowerCase();

  let list = state.students.filter((student) => {
    if (state.status && student.status !== state.status) return false;
    if (state.instructor && student.instructor !== state.instructor) return false;
    if (state.license && student.license_type !== state.license) return false;
    if (!q) return true;

    const haystack = [
      student.student_id,
      student.first_name,
      student.last_name,
      student.email,
      student.city,
      student.state,
      student.instructor,
      student.license_type,
      student.status,
      student.permit_number,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });

  list.sort((a, b) => {
    switch (state.sort) {
      case "name-desc":
        return fullName(b).localeCompare(fullName(a));
      case "lessons-desc":
        return b.lessons_completed - a.lessons_completed;
      case "hours-desc":
        return b.hours_driven - a.hours_driven;
      case "enrolled-desc":
        return b.enrollment_date.localeCompare(a.enrollment_date);
      default:
        return fullName(a).localeCompare(fullName(b));
    }
  });

  state.filtered = list;
  state.page = 1;
  renderStudents();
}

function renderStudents() {
  const total = state.filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  state.page = Math.min(state.page, totalPages);

  const start = (state.page - 1) * PAGE_SIZE;
  const pageItems = state.filtered.slice(start, start + PAGE_SIZE);

  els.resultCount.textContent =
    total === state.students.length
      ? `Showing all ${total.toLocaleString()} students`
      : `${total.toLocaleString()} match · ${state.students.length.toLocaleString()} total`;

  els.grid.innerHTML = pageItems
    .map(
      (student) => `
      <article class="student-card" data-id="${student.student_id}">
        <div class="student-top">
          <div>
            <div class="student-id">${student.student_id}</div>
            <h3>${fullName(student)}</h3>
            <div class="student-meta">Grade ${student.grade} · ${student.city}, ${student.state}</div>
          </div>
          <span class="badge ${badgeClass(student.status)}">${student.status}</span>
        </div>
        <dl class="student-details">
          <dt>Instructor</dt><dd>${student.instructor}</dd>
          <dt>License</dt><dd>${student.license_type}</dd>
          <dt>Lessons</dt><dd>${student.lessons_completed}</dd>
          <dt>Hours</dt><dd>${student.hours_driven}</dd>
        </dl>
      </article>
    `
    )
    .join("");

  els.pageInfo.textContent = `Page ${state.page} of ${totalPages}`;
  els.prevPage.disabled = state.page <= 1;
  els.nextPage.disabled = state.page >= totalPages;

  els.grid.querySelectorAll(".student-card").forEach((card) => {
    card.addEventListener("click", () => {
      const student = state.students.find((s) => s.student_id === card.dataset.id);
      if (student) openModal(student);
    });
  });
}

function openModal(student) {
  els.modalContent.innerHTML = `
    <div class="modal-header">
      <div class="student-id">${student.student_id}</div>
      <h3>${fullName(student)}</h3>
      <span class="badge ${badgeClass(student.status)}">${student.status}</span>
    </div>
    <dl class="modal-grid">
      <div class="modal-item"><dt>Email</dt><dd>${student.email}</dd></div>
      <div class="modal-item"><dt>Phone</dt><dd>${student.phone}</dd></div>
      <div class="modal-item"><dt>Age / Grade</dt><dd>${student.age} · Grade ${student.grade}</dd></div>
      <div class="modal-item"><dt>Address</dt><dd>${student.address}, ${student.city}, ${student.state} ${student.zip}</dd></div>
      <div class="modal-item"><dt>Parent / Guardian</dt><dd>${student.parent_guardian}</dd></div>
      <div class="modal-item"><dt>Emergency</dt><dd>${student.emergency_contact}</dd></div>
      <div class="modal-item"><dt>License Type</dt><dd>${student.license_type}</dd></div>
      <div class="modal-item"><dt>Permit #</dt><dd>${student.permit_number}</dd></div>
      <div class="modal-item"><dt>Instructor</dt><dd>${student.instructor}</dd></div>
      <div class="modal-item"><dt>Vehicle</dt><dd>${student.vehicle_type}</dd></div>
      <div class="modal-item"><dt>Schedule</dt><dd>${student.preferred_schedule}</dd></div>
      <div class="modal-item"><dt>Enrolled</dt><dd>${formatDate(student.enrollment_date)}</dd></div>
      <div class="modal-item"><dt>Lessons</dt><dd>${student.lessons_completed}</dd></div>
      <div class="modal-item"><dt>Hours Driven</dt><dd>${student.hours_driven}</dd></div>
      <div class="modal-item"><dt>Road Test</dt><dd>${formatDate(student.road_test_date)}</dd></div>
      <div class="modal-item"><dt>Payment</dt><dd>${student.payment_status}</dd></div>
    </dl>
    ${
      student.notes
        ? `<div class="modal-notes"><strong>Instructor notes:</strong> ${student.notes}</div>`
        : ""
    }
  `;
  els.modal.showModal();
}

function bindEvents() {
  let searchTimer;
  els.search.addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.search = e.target.value;
      applyFilters();
    }, 180);
  });

  els.filterStatus.addEventListener("change", (e) => {
    state.status = e.target.value;
    applyFilters();
  });

  els.filterInstructor.addEventListener("change", (e) => {
    state.instructor = e.target.value;
    applyFilters();
  });

  els.filterLicense.addEventListener("change", (e) => {
    state.license = e.target.value;
    applyFilters();
  });

  els.sortBy.addEventListener("change", (e) => {
    state.sort = e.target.value;
    applyFilters();
  });

  els.prevPage.addEventListener("click", () => {
    state.page -= 1;
    renderStudents();
    document.getElementById("registry").scrollIntoView({ behavior: "smooth" });
  });

  els.nextPage.addEventListener("click", () => {
    state.page += 1;
    renderStudents();
    document.getElementById("registry").scrollIntoView({ behavior: "smooth" });
  });

  els.modalClose.addEventListener("click", () => els.modal.close());
  els.modal.addEventListener("click", (e) => {
    if (e.target === els.modal) els.modal.close();
  });
}

async function init() {
  bindEvents();

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error("Failed to load dataset");
    const data = await response.json();
    state.students = data.students;

    const stats = computeStats(state.students);
    renderHeroStats(stats);
    renderStatsBar(stats);
    renderInstructors(state.students);
    populateFilters(state.students);

    state.filtered = [...state.students];
    els.loading.classList.add("hidden");
    els.grid.classList.remove("hidden");
    els.pagination.classList.remove("hidden");
    renderStudents();
  } catch (error) {
    els.loading.innerHTML = `
      <p>Could not load student data. Run a local server from the project folder:</p>
      <p><code>python3 -m http.server 8000</code></p>
    `;
    console.error(error);
  }
}

init();
