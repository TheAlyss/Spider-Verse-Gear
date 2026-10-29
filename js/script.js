// Spider-Verse Gear - Multiverse Raid Resource Planner
// ICT600 Individual Assignment
// Matric No: 2024669362 (Muhamad Aiman Bin Zulmahjedi)

// Base daily supplies per hero for each boss tier
const BOSS_TIERS = {
    "Easy": { medGel: 3, webFluid: 2, shieldCharge: 1 },
    "Normal": { medGel: 6, webFluid: 4, shieldCharge: 2 },
    "Hard": { medGel: 9, webFluid: 6, shieldCharge: 3 },
    "Very Hard": { medGel: 12, webFluid: 8, shieldCharge: 4 },
    "Hardcore": { medGel: 15, webFluid: 10, shieldCharge: 5 }
};

// Strategy modifiers added to tier supplies per hero per day
const STRATEGY_EXTRAS = {
    "balanced": { medGel: 0, webFluid: 0, shieldCharge: 0, label: "Balanced (No Extra)" },
    "stealth": { medGel: 0, webFluid: 2, shieldCharge: 0, label: "Stealth (+2 Web-Fluid / Hero / Day)" },
    "assault": { medGel: 2, webFluid: 0, shieldCharge: 1, label: "All-Out Assault (+2 Med-Gel, +1 Shield Charge / Hero / Day)" }
};

// Item unit prices in RM
const ITEM_PRICES = {
    medGel: 5.00,
    webFluid: 8.00,
    shieldCharge: 15.00
};

// Power-up prices per hero
const POWERUP_PRICES = {
    "revive": { name: "Revive Serum", price: 60.00 },
    "webshooter": { name: "Web-Shooter Upgrade", price: 80.00 },
    "armor": { name: "Spider-Armor Plating", price: 100.00 }
};

// Hero display names
const HERO_NAMES = {
    "miles": "Miles Morales",
    "gwen": "Spider-Gwen",
    "miguel": "Miguel O'Hara",
    "noir": "Spider-Man Noir",
    "peni": "Peni Parker"
};

// Escape special characters to prevent XSS
function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Format numbers into RM currency with 2 decimal places
function formatRM(amount) {
    return "RM " + Number(amount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Pluralisation helper: returns "1 unit" or "2 units"
function plural(n, singular, pluralForm) {
    return `${n} ${n === 1 ? singular : pluralForm}`;
}

// Fallback to placeholder box with first letter if image is not found
function attachImageFallback(imgElement, labelName) {
    if (!imgElement) return;

    imgElement.addEventListener("error", function () {
        const initial = (labelName && labelName.trim().length > 0)
            ? labelName.trim().charAt(0).toUpperCase()
            : "?";

        const placeholder = document.createElement("div");
        placeholder.className = "img-placeholder";
        if (imgElement.classList.contains("boss-preview-img")) {
            placeholder.classList.add("boss-preview-img");
        }
        placeholder.setAttribute("aria-label", labelName || "Image placeholder");
        placeholder.textContent = initial;

        imgElement.replaceWith(placeholder);
    });
}

// Kiosk page setup
document.addEventListener("DOMContentLoaded", function () {
    const plannerForm = document.getElementById("plannerForm");
    const bossSelect = document.getElementById("boss");
    const bossPreview = document.getElementById("bossPreview");
    const resultBox = document.getElementById("resultBox");
    const resetBtn = document.getElementById("resetBtn");
    const heroCheckboxes = document.querySelectorAll('input[name="heroes"]');

    if (!plannerForm) return;

    // Attach fallback to hero card images
    const squadImages = document.querySelectorAll(".hero-card-img");
    squadImages.forEach(function (img) {
        const altText = img.getAttribute("alt") || "Hero";
        attachImageFallback(img, altText);
    });

    // Toggle card selection highlight when checked
    heroCheckboxes.forEach(function (chk) {
        chk.addEventListener("change", function () {
            const cardLabel = chk.closest(".hero-choice-card");
            if (cardLabel) {
                if (chk.checked) {
                    cardLabel.classList.add("selected");
                } else {
                    cardLabel.classList.remove("selected");
                }
            }
        });
    });

    // Live preview when a boss is chosen
    bossSelect.addEventListener("change", function () {
        const selectedValue = bossSelect.value;
        const selectedOption = bossSelect.options[bossSelect.selectedIndex];

        if (!selectedValue || !selectedOption) {
            bossPreview.innerHTML = `
                <p class="preview-placeholder">Select a boss above to inspect threat level, intelligence briefing and tier parameters.</p>
            `;
            return;
        }

        const bossName = selectedOption.text;
        const bossTier = selectedOption.getAttribute("data-tier") || "Unknown";
        const bossPower = selectedOption.getAttribute("data-power") || "No threat briefing available.";
        const bossImgSrc = "images/bosses/" + selectedValue + ".jpg";

        bossPreview.innerHTML = `
            <div class="boss-preview-active-layout">
                <img src="${bossImgSrc}" alt="${escapeHTML(bossName)}" class="boss-preview-img" width="90" height="90">
                <div class="boss-preview-info">
                    <h4>${escapeHTML(bossName)} <span class="tier-pill tier-${bossTier.toLowerCase().replace(/\s+/g, '')}">${escapeHTML(bossTier)} Tier</span></h4>
                    <p class="boss-preview-power"><strong>Threat Intelligence:</strong> ${escapeHTML(bossPower)}</p>
                </div>
            </div>
        `;

        const previewImg = bossPreview.querySelector(".boss-preview-img");
        if (previewImg) {
            attachImageFallback(previewImg, bossName);
        }
    });

    // Handle form submit and calculation
    plannerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        // Read input values from the DOM
        const nameInput = document.getElementById("customerName");
        const emailInput = document.getElementById("customerEmail");
        const daysInput = document.getElementById("numDays");

        const rawName = nameInput ? nameInput.value.trim() : "";
        const rawEmail = emailInput ? emailInput.value.trim() : "";
        const rawDays = daysInput ? daysInput.value.trim() : "";
        const selectedBossValue = bossSelect ? bossSelect.value : "";
        const selectedBossOption = bossSelect ? bossSelect.options[bossSelect.selectedIndex] : null;

        const strategyRadio = document.querySelector('input[name="strategy"]:checked');
        const strategyValue = strategyRadio ? strategyRadio.value : "";

        // Number of heroes equals ticked checkboxes
        const tickedHeroCheckboxes = Array.from(document.querySelectorAll('input[name="heroes"]:checked'));
        const heroCount = tickedHeroCheckboxes.length;

        const tickedPowerupCheckboxes = Array.from(document.querySelectorAll('input[name="powerups"]:checked'));

        // Validation list
        const validationErrors = [];

        // Check leader name
        if (rawName === "" || rawName.length < 2) {
            validationErrors.push("Squad Leader / Customer Name is required (minimum 2 characters).");
        }

        // Check email pattern
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (rawEmail === "" || !emailRegex.test(rawEmail)) {
            validationErrors.push("A valid Email Address is required (e.g. hero@spiderverse.org).");
        }

        // Check mission days (must be integer between 1 and 30)
        const daysNumber = Number(rawDays);
        if (rawDays === "" || isNaN(daysNumber) || !Number.isInteger(daysNumber) || daysNumber < 1 || daysNumber > 30) {
            validationErrors.push("Number of Days is required and must be an integer between 1 and 30.");
        }

        // Check boss selection
        if (selectedBossValue === "" || !selectedBossOption) {
            validationErrors.push("Please select a Boss for the multiverse raid.");
        }

        // Check squad selection (1 to 5 heroes)
        if (heroCount < 1 || heroCount > 5) {
            validationErrors.push("Please select between 1 and 5 heroes for your Spider-squad.");
        }

        // Check raid strategy
        if (!strategyRadio || strategyValue === "") {
            validationErrors.push("Please select a Raid Strategy (Balanced, Stealth, or All-Out Assault).");
        }

        // Stop calculation if any validation fails
        if (validationErrors.length > 0) {
            alert("Invalid input, please check your form:\n• " + validationErrors.join("\n• "));
            if (resultBox) {
                resultBox.hidden = true;
            }
            return;
        }

        // Supply and cost calculations
        const bossName = selectedBossOption.text;
        const bossTier = selectedBossOption.getAttribute("data-tier");
        const bossPower = selectedBossOption.getAttribute("data-power") || "";

        const tierData = BOSS_TIERS[bossTier];
        const strategyData = STRATEGY_EXTRAS[strategyValue];

        // Supplies per hero per day
        const perHeroPerDayMedGel = Number(tierData.medGel) + Number(strategyData.medGel);
        const perHeroPerDayWebFluid = Number(tierData.webFluid) + Number(strategyData.webFluid);
        const perHeroPerDayShieldCharge = Number(tierData.shieldCharge) + Number(strategyData.shieldCharge);

        // Supplies each hero carries for the whole duration
        const eachHeroCarriesMedGel = perHeroPerDayMedGel * daysNumber;
        const eachHeroCarriesWebFluid = perHeroPerDayWebFluid * daysNumber;
        const eachHeroCarriesShieldCharge = perHeroPerDayShieldCharge * daysNumber;

        // Total supplies for the whole squad
        const squadTotalMedGel = eachHeroCarriesMedGel * heroCount;
        const squadTotalWebFluid = eachHeroCarriesWebFluid * heroCount;
        const squadTotalShieldCharge = eachHeroCarriesShieldCharge * heroCount;

        // Base item costs
        const costMedGel = squadTotalMedGel * Number(ITEM_PRICES.medGel);
        const costWebFluid = squadTotalWebFluid * Number(ITEM_PRICES.webFluid);
        const costShieldCharge = squadTotalShieldCharge * Number(ITEM_PRICES.shieldCharge);

        const itemsSubtotal = costMedGel + costWebFluid + costShieldCharge;

        // Power-ups cost (one-time per hero)
        let totalPowerupsCost = 0;
        const powerupRowsHTML = [];
        const chosenPowerupNames = [];
        const powerupExplDetails = [];

        tickedPowerupCheckboxes.forEach(function (chk) {
            const pKey = chk.value;
            const pConfig = POWERUP_PRICES[pKey];
            if (pConfig) {
                const pUnitCost = Number(pConfig.price);
                const pSquadCost = pUnitCost * heroCount;
                totalPowerupsCost += pSquadCost;
                chosenPowerupNames.push(pConfig.name);

                powerupRowsHTML.push(`
                    <tr>
                        <td><strong>${escapeHTML(pConfig.name)}</strong> (One-Time Squad Power-Up)</td>
                        <td>-</td>
                        <td>${plural(1, "unit", "units")}</td>
                        <td>${plural(heroCount, "unit", "units")}</td>
                        <td>${formatRM(pSquadCost)}</td>
                    </tr>
                `);

                powerupExplDetails.push(
                    `${escapeHTML(pConfig.name)} ${formatRM(pUnitCost)} x ${plural(heroCount, "hero", "heroes")} = ${formatRM(pSquadCost)}`
                );
            }
        });

        // Grand total
        const grandEstimatedTotal = itemsSubtotal + totalPowerupsCost;

        // Generate squad chips for result display
        const heroChipsHTML = tickedHeroCheckboxes.map(function (chk) {
            const hKey = chk.value;
            const hName = HERO_NAMES[hKey] || hKey;
            const hImgSrc = "images/heroes/" + hKey + ".jpg";
            return `
                <div class="result-hero-chip">
                    <img src="${hImgSrc}" alt="${escapeHTML(hName)}" class="result-hero-thumb" width="40" height="40">
                    <span class="result-hero-name">${escapeHTML(hName)}</span>
                </div>
            `;
        }).join("");

        const powerupsSummaryText = chosenPowerupNames.length > 0
            ? chosenPowerupNames.map(escapeHTML).join(", ")
            : "None";

        // Build dynamic rules text from actual variables
        const baselineRuleText = `${escapeHTML(bossName)} (${escapeHTML(bossTier)} Tier) baseline requires ${tierData.medGel} Med-Gel, ${tierData.webFluid} Web-Fluid, and ${tierData.shieldCharge} Shield Charge per hero/day.`;

        const strategyName = strategyValue === "assault"
            ? "All-Out Assault"
            : (strategyValue === "stealth" ? "Stealth" : "Balanced");
        const strategyAdditions = [];
        if (strategyData.medGel > 0) {
            strategyAdditions.push(`+${strategyData.medGel} Med-Gel`);
        }
        if (strategyData.webFluid > 0) {
            strategyAdditions.push(`+${strategyData.webFluid} Web-Fluid`);
        }
        if (strategyData.shieldCharge > 0) {
            strategyAdditions.push(`+${strategyData.shieldCharge} Shield Charge`);
        }

        const strategyRuleText = strategyAdditions.length === 0
            ? "Balanced: no extra supplies."
            : `${strategyName} added ${strategyAdditions.join(", ")} per hero/day.`;

        const calculationRuleText = `Each of the ${plural(heroCount, "hero", "heroes")} carries the daily requirements for ${plural(daysNumber, "day", "days")}. Unit rates: Med-Gel (${formatRM(ITEM_PRICES.medGel)}), Web-Fluid (${formatRM(ITEM_PRICES.webFluid)}), Shield Charge (${formatRM(ITEM_PRICES.shieldCharge)}).`;

        const powerupsRuleHTML = powerupExplDetails.length > 0
            ? `<br><strong>Power-ups (one-time, per hero):</strong> ${powerupExplDetails.join("; ")}.`
            : "";

        // Display results on the page
        if (resultBox) {
            resultBox.hidden = false;
        }
        resultBox.innerHTML = `
            <div class="result-heading-wrap">
                <h3>Raid Plan: ${escapeHTML(bossName)}</h3>
            </div>

            <div class="result-combatants-layout">
                <div class="result-boss-card">
                    <h4 class="result-combatant-title">Target Boss Intelligence</h4>
                    <div class="result-boss-detail">
                        <img src="images/bosses/${selectedBossValue}.jpg" alt="${escapeHTML(bossName)}" class="result-boss-img" width="75" height="75">
                        <div class="result-boss-text">
                            <strong>${escapeHTML(bossName)}</strong>
                            <span class="tier-pill tier-${bossTier.toLowerCase().replace(/\s+/g, '')}">${escapeHTML(bossTier)} Tier</span>
                            <p class="boss-preview-power">${escapeHTML(bossPower)}</p>
                        </div>
                    </div>
                </div>

                <div class="result-squad-card">
                    <h4 class="result-combatant-title">Deployed Squad Roster (${plural(heroCount, "Hero", "Heroes")})</h4>
                    <div class="result-heroes-list">
                        ${heroChipsHTML}
                    </div>
                </div>
            </div>

            <div class="result-summary-grid">
                <div class="result-summary-item">
                    <strong>Squad Leader</strong>
                    <span>${escapeHTML(rawName)}</span>
                </div>
                <div class="result-summary-item">
                    <strong>Official Email</strong>
                    <span>${escapeHTML(rawEmail)}</span>
                </div>
                <div class="result-summary-item">
                    <strong>Mission Duration</strong>
                    <span>${plural(daysNumber, "Day", "Days")}</span>
                </div>
                <div class="result-summary-item">
                    <strong>Deployed Squad Size</strong>
                    <span>${plural(heroCount, "Spider-Hero", "Spider-Heroes")}</span>
                </div>
                <div class="result-summary-item">
                    <strong>Raid Strategy</strong>
                    <span>${escapeHTML(strategyData.label)}</span>
                </div>
                <div class="result-summary-item">
                    <strong>Selected Power-Ups</strong>
                    <span>${powerupsSummaryText}</span>
                </div>
            </div>

            <div class="result-table-wrap" tabindex="0" role="region" aria-label="Raid supply manifest table">
                <table class="result-table">
                    <thead>
                        <tr>
                            <th scope="col">Item</th>
                            <th scope="col">Per Hero / Day</th>
                            <th scope="col">Each Hero Carries</th>
                            <th scope="col">Squad Total</th>
                            <th scope="col">Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Med-Gel</strong> (${formatRM(ITEM_PRICES.medGel)} / unit)</td>
                            <td>${plural(perHeroPerDayMedGel, "unit", "units")}</td>
                            <td>${plural(eachHeroCarriesMedGel, "unit", "units")}</td>
                            <td>${plural(squadTotalMedGel, "unit", "units")}</td>
                            <td>${formatRM(costMedGel)}</td>
                        </tr>
                        <tr>
                            <td><strong>Web-Fluid</strong> (${formatRM(ITEM_PRICES.webFluid)} / unit)</td>
                            <td>${plural(perHeroPerDayWebFluid, "unit", "units")}</td>
                            <td>${plural(eachHeroCarriesWebFluid, "unit", "units")}</td>
                            <td>${plural(squadTotalWebFluid, "unit", "units")}</td>
                            <td>${formatRM(costWebFluid)}</td>
                        </tr>
                        <tr>
                            <td><strong>Shield Charge</strong> (${formatRM(ITEM_PRICES.shieldCharge)} / unit)</td>
                            <td>${plural(perHeroPerDayShieldCharge, "unit", "units")}</td>
                            <td>${plural(eachHeroCarriesShieldCharge, "unit", "units")}</td>
                            <td>${plural(squadTotalShieldCharge, "unit", "units")}</td>
                            <td>${formatRM(costShieldCharge)}</td>
                        </tr>
                        ${powerupRowsHTML.join("")}
                        <tr class="result-total-row">
                            <td colspan="4" class="result-total-label">Estimated Total Raid Expenditure</td>
                            <td class="result-total-amount">${formatRM(grandEstimatedTotal)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="rules-applied-note">
                <h4>Rules Applied for this Raid Manifest</h4>
                <p>
                    <strong>Boss Tier Baseline:</strong> ${baselineRuleText}
                    <br>
                    <strong>Strategy:</strong> ${strategyRuleText}
                    <br>
                    <strong>Calculation:</strong> ${calculationRuleText}${powerupsRuleHTML}
                </p>
            </div>
        `;

        // Attach fallback to newly created images in the result
        const renderedResultImages = resultBox.querySelectorAll("img");
        renderedResultImages.forEach(function (img) {
            const alt = img.getAttribute("alt") || "Combatant";
            attachImageFallback(img, alt);
        });

        // Show alert and scroll down
        alert("Calculation complete! Your raid plan is ready.");
        resultBox.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // Reset button handler
    if (resetBtn) {
        resetBtn.addEventListener("click", function () {
            // Hide result section
            if (resultBox) {
                resultBox.hidden = true;
                resultBox.innerHTML = "";
            }

            // Restore placeholder in boss preview
            bossPreview.innerHTML = `
                <p class="preview-placeholder">Select a boss above to inspect threat level, intelligence briefing and tier parameters.</p>
            `;

            // Remove selected state from hero cards
            const heroCards = document.querySelectorAll(".hero-choice-card");
            heroCards.forEach(function (card) {
                card.classList.remove("selected");
            });
        });
    }
});
