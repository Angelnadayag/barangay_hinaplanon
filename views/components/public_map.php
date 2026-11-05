<div class="public-map-card">
    <div class="public-map-intro">
        <h3>Recorded Hinaplanon hazard map</h3>
        <p>Explore the existing public map. Select a purok or shelter marker to inspect its recorded information.</p>
    </div>
    <div id="<?= htmlspecialchars($publicMapId) ?>" class="public-hazard-map" data-public-map aria-label="Interactive public map of Barangay Hinaplanon"></div>
    <div class="public-map-legend" aria-label="Map legend">
        <span><i class="fa fa-circle" style="color: var(--hazard-pink);" aria-hidden="true"></i> High risk</span>
        <span><i class="fa fa-circle" style="color: var(--hazard-orange);" aria-hidden="true"></i> Medium risk</span>
        <span><i class="fa fa-circle" style="color: var(--hazard-yellow);" aria-hidden="true"></i> Low risk</span>
        <span><i class="fa fa-circle" style="color: var(--hazard-gray);" aria-hidden="true"></i> Pending verification</span>
        <span><i class="fa fa-house" aria-hidden="true"></i> Recorded shelter</span>
    </div>
    <p class="public-map-caution">Risk zones are recorded classifications, not current weather or a guarantee of safety. Allocation figures are recommendations, not confirmed distributions. Confirm shelter availability and safe routes with authorized officials.</p>
    <details class="public-map-reference">
        <summary>View the existing scanned hazard-map reference</summary>
        <a href="assets/images/hinaplanon_hazard_map.jpg" target="_blank" rel="noopener"><img src="assets/images/hinaplanon_hazard_map.jpg" width="1500" height="1000" alt="Scanned Barangay Hinaplanon hazard-map reference; open the full image for details" loading="lazy"></a>
    </details>
</div>
