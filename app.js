/* ============================================
   Arturo Juárez — Estilista
   Main Application JavaScript
   ============================================ */

// ====== NAVIGATION ======
(function initNav() {
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  // Scroll effect
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        // Don't remove scrolled on calendar page (always scrolled)
        if (!document.querySelector('.calendar-page')) {
          navbar.classList.remove('scrolled');
        }
      }
    });
  }

  // Mobile menu toggle
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }
})();

// ====== SMOOTH SCROLL ======
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ====== CALENDAR SYSTEM ======
(function initCalendar() {
  const calendarDays = document.getElementById('calendarDays');
  if (!calendarDays) return; // Not on calendar page

  // State
  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();
  let selectedDate = null;
  let currentLocation = 'acapulco';
  let currentView = 'admin'; // 'admin' or 'client'

  const MONTHS_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const TIME_SLOTS = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
    '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
  ];

  // ====== LOCAL STORAGE ======
  function getStorageKey(year, month) {
    return `aj_calendar_${year}_${month}`;
  }

  function loadMonthData(year, month) {
    const key = getStorageKey(year, month);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  }

  function saveMonthData(year, month, data) {
    const key = getStorageKey(year, month);
    localStorage.setItem(key, JSON.stringify(data));
  }

  function getDayKey(day) {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function getDayData(day) {
    const monthData = loadMonthData(currentYear, currentMonth);
    return monthData[getDayKey(day)] || {};
  }

  function saveDayData(day, data) {
    const monthData = loadMonthData(currentYear, currentMonth);
    monthData[getDayKey(day)] = data;
    saveMonthData(currentYear, currentMonth, monthData);
  }

  // ====== RENDER CALENDAR ======
  function renderCalendar() {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    const today = new Date();

    // Update header
    document.getElementById('currentMonth').textContent = `${MONTHS_ES[currentMonth]} ${currentYear}`;

    let html = '';

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      html += `<div class="calendar-day other-month"><span class="day-number">${day}</span></div>`;
    }

    // Current month days
    const monthData = loadMonthData(currentYear, currentMonth);

    for (let day = 1; day <= daysInMonth; day++) {
      const dayKey = getDayKey(day);
      const dayData = monthData[dayKey] || {};
      const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
      const isSelected = selectedDate === day;

      let statusClass = '';
      if (dayData.status) {
        statusClass = `status-${dayData.status}`;
      }

      // In client view, only show available days
      if (currentView === 'client' && dayData.status && dayData.status !== 'available') {
        statusClass = `status-${dayData.status}`;
      }

      const classes = [
        'calendar-day',
        isToday ? 'today' : '',
        isSelected ? 'selected' : '',
        statusClass
      ].filter(Boolean).join(' ');

      html += `
        <div class="${classes}" data-day="${day}">
          <span class="day-number">${day}</span>
          ${dayData.status ? '<span class="day-indicator"></span>' : ''}
        </div>
      `;
    }

    // Next month days
    const totalCells = firstDay + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remaining; i++) {
      html += `<div class="calendar-day other-month"><span class="day-number">${i}</span></div>`;
    }

    calendarDays.innerHTML = html;

    // Add click listeners
    calendarDays.querySelectorAll('.calendar-day:not(.other-month)').forEach(el => {
      el.addEventListener('click', () => {
        const day = parseInt(el.dataset.day);
        selectDay(day);
      });
    });

    updateStats();
  }

  // ====== SELECT DAY ======
  function selectDay(day) {
    selectedDate = day;
    const dayData = getDayData(day);
    const dayDetail = document.getElementById('dayDetail');
    const dateDisplay = document.getElementById('dayDetailDate');

    dayDetail.classList.add('active');

    const dateObj = new Date(currentYear, currentMonth, day);
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    dateDisplay.textContent = `${dayNames[dateObj.getDay()]} ${day} de ${MONTHS_ES[currentMonth]}, ${currentYear}`;

    if (currentView === 'admin') {
      renderAdminView(dayData);
    } else {
      renderClientView(dayData);
    }

    renderCalendar();
  }

  // ====== ADMIN VIEW ======
  function renderAdminView(dayData) {
    document.getElementById('adminControls').style.display = 'block';
    document.getElementById('clientSlots').style.display = 'none';

    // Status buttons
    document.querySelectorAll('.status-btn[data-status]').forEach(btn => {
      btn.classList.toggle('active', dayData.status === btn.dataset.status);
    });

    // Location buttons
    document.querySelectorAll('.location-btn').forEach(btn => {
      btn.classList.toggle('active', (dayData.location || currentLocation) === btn.dataset.loc);
    });

    // Time slots
    renderTimeSlots(dayData);

    // Notes
    document.getElementById('dayNotes').value = dayData.notes || '';
  }

  function renderTimeSlots(dayData) {
    const slotsContainer = document.getElementById('timeSlots');
    const bookedSlots = dayData.bookedSlots || [];

    let html = '';
    TIME_SLOTS.forEach((slot, index) => {
      const isBooked = bookedSlots.includes(index);
      const cls = isBooked ? 'booked' : (dayData.status === 'available' ? 'available' : '');
      html += `<div class="time-slot ${cls}" data-slot="${index}">${slot}</div>`;
    });

    slotsContainer.innerHTML = html;

    // Click to toggle slot
    slotsContainer.querySelectorAll('.time-slot').forEach(el => {
      el.addEventListener('click', () => {
        el.classList.toggle('booked');
        el.classList.toggle('available');
      });
    });
  }

  // ====== CLIENT VIEW ======
  function renderClientView(dayData) {
    document.getElementById('adminControls').style.display = 'none';
    document.getElementById('clientSlots').style.display = 'block';

    const slotsContainer = document.getElementById('clientTimeSlots');
    const bookedSlots = dayData.bookedSlots || [];

    if (dayData.status !== 'available') {
      slotsContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 1rem 0;">No hay disponibilidad para este día.</p>';
      return;
    }

    let html = '';
    TIME_SLOTS.forEach((slot, index) => {
      const isBooked = bookedSlots.includes(index);
      if (!isBooked) {
        html += `<div class="time-slot available" data-slot="${index}">${slot}</div>`;
      }
    });

    if (!html) {
      slotsContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 1rem 0;">Todos los horarios están ocupados.</p>';
    } else {
      slotsContainer.innerHTML = html;
    }
  }

  // ====== SAVE DAY ======
  document.getElementById('saveDay')?.addEventListener('click', () => {
    if (selectedDate === null) return;

    const status = document.querySelector('.status-btn[data-status].active')?.dataset.status || null;
    const location = document.querySelector('.location-btn.active')?.dataset.loc || currentLocation;
    const notes = document.getElementById('dayNotes').value;

    // Get booked slots
    const bookedSlots = [];
    document.querySelectorAll('#timeSlots .time-slot.booked').forEach(el => {
      bookedSlots.push(parseInt(el.dataset.slot));
    });

    saveDayData(selectedDate, {
      status,
      location,
      notes,
      bookedSlots
    });

    renderCalendar();
    showNotification('Día guardado correctamente');
  });

  // ====== STATUS BUTTONS ======
  document.querySelectorAll('.status-btn[data-status]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.status-btn[data-status]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.querySelectorAll('.location-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.location-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // ====== LOCATION TABS ======
  document.querySelectorAll('.location-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.location-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentLocation = tab.dataset.location;
      renderCalendar();
    });
  });

  // ====== VIEW TOGGLE ======
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.dataset.view;

      const clientInfo = document.getElementById('clientViewInfo');
      const vacPlanner = document.getElementById('vacationPlanner');

      if (currentView === 'client') {
        clientInfo.style.display = 'block';
        if (vacPlanner) vacPlanner.style.display = 'none';
      } else {
        clientInfo.style.display = 'none';
        if (vacPlanner) vacPlanner.style.display = 'block';
      }

      if (selectedDate !== null) {
        selectDay(selectedDate);
      }
    });
  });

  // ====== MONTH NAVIGATION ======
  document.getElementById('prevMonth')?.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    selectedDate = null;
    document.getElementById('dayDetail')?.classList.remove('active');
    renderCalendar();
  });

  document.getElementById('nextMonth')?.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    selectedDate = null;
    document.getElementById('dayDetail')?.classList.remove('active');
    renderCalendar();
  });

  // ====== VACATION PLANNER ======
  document.getElementById('setVacation')?.addEventListener('click', () => {
    const startInput = document.getElementById('vacStart').value;
    const endInput = document.getElementById('vacEnd').value;

    if (!startInput || !endInput) {
      showNotification('Selecciona fechas de inicio y fin', 'error');
      return;
    }

    const start = new Date(startInput + 'T00:00:00');
    const end = new Date(endInput + 'T00:00:00');

    if (end < start) {
      showNotification('La fecha de fin debe ser posterior a la de inicio', 'error');
      return;
    }

    let current = new Date(start);
    let count = 0;

    while (current <= end) {
      const year = current.getFullYear();
      const month = current.getMonth();
      const day = current.getDate();

      const monthData = loadMonthData(year, month);
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      monthData[key] = {
        ...monthData[key],
        status: 'vacation',
        notes: (monthData[key]?.notes || '') + (monthData[key]?.notes ? '\n' : '') + 'Vacaciones programadas'
      };

      saveMonthData(year, month, monthData);
      current.setDate(current.getDate() + 1);
      count++;
    }

    renderCalendar();
    showNotification(`${count} días marcados como vacaciones`);
    document.getElementById('vacStart').value = '';
    document.getElementById('vacEnd').value = '';
  });

  // ====== STATS ======
  function updateStats() {
    const monthData = loadMonthData(currentYear, currentMonth);
    let acapulcoDays = 0;
    let cdmxDays = 0;
    let vacationDays = 0;
    let availableSlots = 0;

    Object.values(monthData).forEach(day => {
      if (day.status === 'vacation') vacationDays++;
      if (day.location === 'acapulco') acapulcoDays++;
      if (day.location === 'cdmx') cdmxDays++;
      if (day.status === 'available') {
        const booked = day.bookedSlots?.length || 0;
        availableSlots += (TIME_SLOTS.length - booked);
      }
    });

    const el = (id) => document.getElementById(id);
    if (el('statAcapulco')) el('statAcapulco').textContent = acapulcoDays;
    if (el('statCDMX')) el('statCDMX').textContent = cdmxDays;
    if (el('statVacation')) el('statVacation').textContent = vacationDays;
    if (el('statAvailable')) el('statAvailable').textContent = availableSlots;
  }

  // ====== NOTIFICATION ======
  function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 2rem;
      background: ${type === 'success' ? 'var(--gold)' : 'var(--red)'};
      color: ${type === 'success' ? 'var(--navy)' : 'var(--white)'};
      font-family: var(--font-body);
      font-size: 0.85rem;
      font-weight: 600;
      z-index: 9999;
      animation: fadeInUp 0.3s ease;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    notif.textContent = message;
    document.body.appendChild(notif);

    setTimeout(() => {
      notif.style.opacity = '0';
      notif.style.transform = 'translateY(10px)';
      notif.style.transition = 'all 0.3s ease';
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  }

  // Initial render
  renderCalendar();

  // Show day detail panel by default
  document.getElementById('dayDetail')?.classList.add('active');
})();
