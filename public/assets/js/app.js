// public/assets/js/app.js
// Barangay Hinaplanon Disaster Management & Leaflet.js Hazard Map Controller

document.addEventListener('DOMContentLoaded', function () {
    // 1. Password Visibility Toggle
    const togglePassBtn = document.getElementById('togglePassword');
    const passInput = document.getElementById('password');
    if (togglePassBtn && passInput) {
        togglePassBtn.addEventListener('click', function () {
            const isPass = passInput.getAttribute('type') === 'password';
            passInput.setAttribute('type', isPass ? 'text' : 'password');
            this.innerHTML = isPass ? '<i class="fa fa-eye-slash"></i>' : '<i class="fa fa-eye"></i>';
            this.setAttribute('aria-label', isPass ? 'Hide password' : 'Show password');
            this.setAttribute('aria-pressed', String(isPass));
            this.title = isPass ? 'Hide password' : 'Show password';
        });
    }

    // 3. Auto-Calculate Affected Population from Households (1 HH ~ 4-5 persons)
    const hhInput = document.getElementById('affected_households');
    const popInput = document.getElementById('affected_population');
    if (hhInput && popInput) {
        hhInput.addEventListener('input', function () {
            const hh = parseInt(this.value, 10) || 0;
            if (!popInput.dataset.manualEdited) {
                popInput.value = hh * 4;
            }
        });
        popInput.addEventListener('input', function () {
            popInput.dataset.manualEdited = "true";
        });
    }

    // 4. Recommendation Review Toggle Helper
    const reviewActionSelect = document.getElementById('review_action');
    const modQtyGroup = document.getElementById('modified_qty_group');
    if (reviewActionSelect && modQtyGroup) {
        reviewActionSelect.addEventListener('change', function () {
            if (this.value === 'modify') {
                modQtyGroup.style.display = 'block';
            } else {
                modQtyGroup.style.display = 'none';
            }
        });
    }

    // 5. Real-Time Notification Poller (Polls every 20s if authenticated)
    const notifBadge = document.getElementById('notifBadgeCount');
    if (notifBadge) {
        setInterval(function () {
            fetch('index.php?route=notifications-poll')
                .then(res => res.json())
                .then(data => {
                    if (data && data.success) {
                        const count = parseInt(data.unread_count, 10) || 0;
                        notifBadge.textContent = count;
                        if (count > 0) {
                            notifBadge.style.display = 'flex';
                        } else {
                            notifBadge.style.display = 'none';
                        }
                    }
                })
                .catch(() => {});
        }, 20000);
    }
});

/**
 * Universal Leaflet.js Interactive Hazard Map Initializer
 * Renders verified Hinaplanon hazard zones, evacuation centers, and active incidents.
 */
window.initHazardMap = function (containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    if (typeof L === 'undefined') {
        container.classList.add('map-unavailable');
        container.textContent = 'The interactive map could not load. Check your internet connection and reload this page. Other page information remains available.';
        return null;
    }
    const mapMessage = document.createElement('div');
    mapMessage.className = 'map-message';
    mapMessage.setAttribute('role', 'status');
    mapMessage.setAttribute('aria-live', 'polite');
    mapMessage.textContent = 'Loading recorded map information…';
    container.after(mapMessage);

    // Centered at Barangay Hinaplanon, Iligan City (8.2412, 124.2543)
    const map = L.map(containerId, {
        center: [8.2412, 124.2543],
        zoom: options.zoom || 14,
        zoomControl: true
    });

    // OpenStreetMap standard tile layer
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | BDRRMC Hinaplanon',
        maxZoom: 19
    }).addTo(map);
    let tilesUnavailable = false;
    tiles.on('tileerror', () => {
        tilesUnavailable = true;
        mapMessage.classList.add('is-error');
        mapMessage.textContent = 'Some map tiles could not load. Recorded markers may still be available. Check your internet connection.';
    });
    if (typeof ResizeObserver !== 'undefined') {
        const resize = new ResizeObserver(() => map.invalidateSize({ pan: false }));
        resize.observe(container);
        window.addEventListener('beforeunload', () => resize.disconnect());
    }
    window.addEventListener('padayon:layout', () => setTimeout(() => map.invalidateSize({ pan: false }), 220));

    // Layer Groups
    const hazardLayer = L.layerGroup().addTo(map);
    const shelterLayer = L.layerGroup().addTo(map);
    const incidentLayer = L.layerGroup().addTo(map);
    const reportLayer = L.layerGroup().addTo(map);

    function getRiskColor(risk) {
        switch (String(risk).toLowerCase()) {
            case 'high': return '#e11d48';    // Pink
            case 'medium': return '#ea580c';  // Orange
            case 'low': return '#ca8a04';     // Yellow
            default: return '#64748b';        // Gray
        }
    }

    function renderMapData(data) {
        // API strings are text, not trusted markup, including in the anonymous public view.
        const popupRecord = record => Object.fromEntries(Object.entries(record).map(([key, value]) => [key,
            typeof value === 'string' ? value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])) : value
        ]));
        hazardLayer.clearLayers();
        shelterLayer.clearLayers();
        incidentLayer.clearLayers();
        reportLayer.clearLayers();

        // 1. Render Puroks (Hazard Zones & ML/XAI Priority Assessments)
        if (data.puroks && Array.isArray(data.puroks)) {
            data.puroks.forEach(record => {
                const p = popupRecord(record);
                if (p.lat && p.lng) {
                    const color = getRiskColor(p.risk);
                    const circle = L.circle([p.lat, p.lng], {
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.35,
                        radius: p.risk === 'High' ? 260 : 200,
                        weight: 2
                    });

                    const priorityBadgeColor = p.priority_level === 'Critical' ? '#dc2626' : (p.priority_level === 'High' ? '#ea580c' : (p.priority_level === 'Moderate' ? '#ca8a04' : '#16a34a'));

                    const popup = `
                        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; min-width: 250px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                <div style="font-weight: 800; font-size: 14px; color: #0f172a;">
                                    <i class="fa fa-map-pin"></i> ${p.name}
                                </div>
                                ${p.priority_rank ? `<span style="background: #1e293b; color: #ffffff; padding: 1px 6px; border-radius: 4px; font-weight: 800; font-size: 11px;">Rank #${p.priority_rank}</span>` : ''}
                            </div>
                            <div style="display: flex; gap: 4px; margin-bottom: 8px; flex-wrap: wrap;">
                                <span style="background:${color}; color:#ffffff; padding: 2px 6px; border-radius: 4px; font-weight:700; font-size: 11px;">
                                    ${p.risk} Risk (${p.color})
                                </span>
                                <span style="background:${priorityBadgeColor}; color:#ffffff; padding: 2px 6px; border-radius: 4px; font-weight:700; font-size: 11px;">
                                    <i class="fa fa-microchip"></i> ${p.priority_level} Priority
                                </span>
                            </div>
                            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; margin-bottom: 8px;">
                                <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
                                    <span style="color: #64748b;">Affected Families:</span>
                                    <strong style="color: #0f172a;">${p.affected_households} HH (${p.affected_population} persons)</strong>
                                </div>
                                ${p.totally_damaged_houses > 0 ? `
                                    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px; color: #dc2626;">
                                        <span>Destroyed Houses:</span>
                                        <strong>${p.totally_damaged_houses} houses</strong>
                                    </div>
                                ` : ''}
                                <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
                                    <span style="color: #64748b;">Recommended Relief:</span>
                                    <strong style="color: #2563eb;">${p.recommended_rice_kg} kg Rice (${p.recommended_canned_tins} cans)</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                                    <span style="color: #64748b;">Designated Haven:</span>
                                    <strong style="color: #0f172a;">${p.evacuation_haven}</strong>
                                </div>
                            </div>
                            ${p.explanation_narrative ? `
                                <div style="font-size: 11px; color: #334155; line-height: 1.35; margin-bottom: 8px; background: #eff6ff; padding: 6px 8px; border-left: 3px solid #3b82f6; border-radius: 0 4px 4px 0;">
                                    <strong><i class="fa fa-brain text-primary"></i> AI Rationale:</strong> ${p.explanation_narrative}
                                </div>
                            ` : ''}
                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #94a3b8;">
                                <span>Status: ${p.data_completeness || 'Not reported'}</span>
                                ${!options.publicView && ['ICDRRMO', 'Barangay Head', 'Responder'].includes(data.role) ? '<a href="index.php?route=recommendations" style="font-weight: 700; color: #0f766e; text-decoration: none;">View allocation details &rarr;</a>' : '<span>Recorded assessment reference</span>'}
                            </div>
                        </div>
                    `;
                    circle.bindPopup(popup);
                    hazardLayer.addLayer(circle);
                }
            });
        }

        // 2. Render Evacuation Shelters
        if (data.shelters && Array.isArray(data.shelters)) {
            data.shelters.forEach(record => {
                const s = popupRecord(record);
                if (s.lat && s.lng) {
                    const statusColor = s.status === 'Full' ? '#dc2626' : (s.status === 'Near Full' ? '#ea580c' : '#16a34a');
                    const shelterIcon = L.divIcon({
                        className: 'custom-shelter-marker',
                        html: `<div style="background-color: ${statusColor}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-size: 14px;"><i class="fa fa-person-shelter"></i></div>`,
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    });

                    const marker = L.marker([s.lat, s.lng], { icon: shelterIcon });
                    const popup = `
                        <div style="font-family: inherit; font-size: 13px;">
                            <div style="font-weight: 800; color: #0f172a; font-size: 14px; margin-bottom: 4px;">
                                <i class="fa fa-building-shield text-primary"></i> ${s.name}
                            </div>
                            <div style="margin-bottom: 4px;">
                                <span style="background: ${statusColor}; color: #ffffff; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 11px;">
                                    ${s.status} (${s.occupancy} / ${s.max_capacity} Evacuees)
                                </span>
                            </div>
                            <div style="color: #475569; font-size: 12px;"><strong>Location:</strong> ${s.location}</div>
                            <div style="color: #475569; font-size: 12px; margin-top: 2px;"><strong>Contact:</strong> ${s.contact}</div>
                        </div>
                    `;
                    marker.bindPopup(popup);
                    shelterLayer.addLayer(marker);
                }
            });
        }

        // 3. Render Incidents (If authorized)
        if (data.incidents && Array.isArray(data.incidents)) {
            data.incidents.forEach(record => {
                const inc = popupRecord(record);
                if (inc.lat && inc.lng) {
                    const isUrgent = inc.is_urgent || inc.severity === 'Critical' || inc.is_sos;
                    const markerColor = isUrgent ? '#dc2626' : '#2563eb';
                    const iconName = inc.is_sos ? 'fa-life-ring' : 'fa-triangle-exclamation';

                    const incidentIcon = L.divIcon({
                        className: 'custom-incident-marker',
                        html: `<div style="background-color: ${markerColor}; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #ffffff; border: 2px solid #ffffff; box-shadow: 0 3px 8px rgba(0,0,0,0.35); font-size: 13px;"><i class="fa ${iconName}"></i></div>`,
                        iconSize: [28, 28],
                        iconAnchor: [14, 14]
                    });

                    const marker = L.marker([inc.lat, inc.lng], { icon: incidentIcon });
                    const popup = `
                        <div style="font-family: inherit; font-size: 13px; min-width: 180px;">
                            <div style="font-weight: 800; font-size: 14px; color: ${markerColor}; margin-bottom: 2px;">
                                ${inc.is_sos ? 'EMERGENCY SOS: ' : ''}${inc.disaster_type}
                            </div>
                            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">Ref: ${inc.ref} | ${inc.purok}</div>
                            <div style="display: flex; gap: 4px; margin-bottom: 6px;">
                                <span style="background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 3px; font-weight: 700; font-size: 11px;">
                                    ${inc.severity} Severity
                                </span>
                                <span style="background: #e0f2fe; color: #0369a1; padding: 1px 6px; border-radius: 3px; font-weight: 700; font-size: 11px;">
                                    ${inc.status}
                                </span>
                            </div>
                            <div style="font-size: 12px; color: #334155; margin-bottom: 6px;">
                                <strong>Affected:</strong> ${inc.households} Families (${inc.population} persons)
                            </div>
                            ${inc.predicted_priority ? `
                                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 4px 6px; border-radius: 4px; font-size: 11px; margin-bottom: 6px;">
                                    <strong>ML Priority:</strong> ${inc.predicted_priority} | Need: ${inc.recommended_qty || 0} packs
                                </div>
                            ` : ''}
                            <div style="font-size: 11px; color: #475569; margin-bottom: 8px;">${inc.description}</div>
                            <a href="index.php?route=disaster-requests-show&id=${inc.id}" class="btn btn-primary btn-sm" style="color: #ffffff !important; display: inline-block;">
                                View Full Incident Details
                            </a>
                        </div>
                    `;
                    marker.bindPopup(popup);
                    incidentLayer.addLayer(marker);
                }
            });
        }

        // Update sync timestamp
        const syncTimeEl = document.getElementById('mapSyncTime');
        if (syncTimeEl) {
            syncTimeEl.textContent = new Date().toLocaleTimeString();
        }
    }

    let refreshing = false;
    const refreshBtn = document.getElementById('btnMapRefresh');
    function fetchAndRefresh() {
        if (refreshing) return;
        refreshing = true;
        if (refreshBtn) { refreshBtn.disabled = true; refreshBtn.setAttribute('aria-busy', 'true'); }
        fetch('index.php?route=api-map-data', { credentials: options.publicView ? 'omit' : 'same-origin' })
            .then(res => { if (!res.ok) throw new Error('Map request returned HTTP ' + res.status); return res.json(); })
            .then(data => {
                if (data && data.success) {
                    renderMapData(data);
                    mapMessage.classList.toggle('is-error', tilesUnavailable);
                    mapMessage.textContent = tilesUnavailable ? 'Map data updated, but some background tiles are unavailable.' : 'Recorded map information updated. Select a marker for details. Updates are checked every 20 seconds.';
                } else throw new Error('Map information is unavailable');
            })
            .catch(err => {
                console.warn('Map sync failed:', err);
                mapMessage.classList.add('is-error');
                mapMessage.textContent = 'Map data could not be updated. Any previously shown markers may be out of date. Try Sync or reload the page.';
                const syncTime = document.getElementById('mapSyncTime');
                if (syncTime) syncTime.textContent = 'Update unavailable';
            })
            .finally(() => {
                refreshing = false;
                if (refreshBtn) { refreshBtn.disabled = false; refreshBtn.removeAttribute('aria-busy'); }
            });
    }

    // Initial load
    fetchAndRefresh();

    // Auto-refresh polling every 20 seconds
    const intervalId = setInterval(fetchAndRefresh, 20000);

    // Manual Refresh button
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function () {
            fetchAndRefresh();
        });
    }

    // Clean up when navigating away
    window.addEventListener('beforeunload', () => clearInterval(intervalId));

    return map;
};
