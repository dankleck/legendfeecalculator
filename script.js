// Updated April 17 9:40am

let feeVisible = false;
let feeCalculated = false;

document.getElementById('aumSlider').addEventListener('input', function () {
    let aumValue = this.value;

    if (aumValue < 1000000) {
        this.step = 5000;
    } else {
        this.step = 10000;
    }

    document.getElementById('aum').value = formatCurrency(aumValue);

    if (feeCalculated) {
        calculateFee();
    }
});

document.getElementById('aum').addEventListener('input', function () {
    formatCurrencyInput();

    let aumValue = parseFloat(this.value.replace(/[^0-9]/g, ''));
    if (!isNaN(aumValue)) {
        document.getElementById('aumSlider').value = aumValue;
    }

    if (feeCalculated) {
        calculateFee();
    }
});

function formatCurrencyInput() {
    let input = document.getElementById('aum');
    let rawValue = input.value.replace(/[^0-9]/g, '');
    if (rawValue) {
        input.value = formatCurrency(rawValue);
    }
}

function setAUM(amount) {
    document.getElementById('aum').value = formatCurrency(amount);
    document.getElementById('aumSlider').value = amount;

    if (feeCalculated) {
        calculateFee();
    }
}

function calculateFee() {
    let amount = parseFloat(document.getElementById('aum').value.replace(/[^0-9]/g, ''));
    if (isNaN(amount) || amount < 250000) {
        document.getElementById('feeOutput').innerText = "Invalid input";
        document.getElementById('feeBreakdown').innerText = "";
        return;
    }

    let totalFee = 0;
    let remaining = amount;

    const tiers = [
        { limit: 500000, rate: 0.009 },
        { limit: 1000000, rate: 0.0085 },
        { limit: 2000000, rate: 0.0075 },
        { limit: 5000000, rate: 0.005 },
        { limit: Infinity, rate: 0.0025 },
    ];

    let previousLimit = 0;
    let breakdownText = "";

    for (let tier of tiers) {
        if (remaining <= 0) break;
        let taxableAmount = Math.min(remaining, tier.limit - previousLimit);
        let tierFee = taxableAmount * tier.rate;
        totalFee += tierFee;
        breakdownText += `${formatCurrency(taxableAmount)} at ${formatPercentage(tier.rate)} = ${formatCurrency(tierFee)}\n`;
        remaining -= taxableAmount;
        previousLimit = tier.limit;
    }

    if (totalFee < 3000) {
        totalFee = 3000;
        breakdownText += `\nMinimum annual fee applied: ${formatCurrency(3000)}`;
    }

    totalFee = totalFee.toFixed(2);

    document.getElementById('feeOutput').innerText = `Annual Fee: ${formatCurrency(totalFee)}`;
    const averageFeePercent = ((totalFee / amount) * 100).toFixed(2);
    document.getElementById('feeBreakdown').innerHTML =
        `<strong>Fee Breakdown by Tier:</strong><br><br>` +
        `${breakdownText.trim().replace(/\n/g, '<br>')}<br><br>` +
        `<em>Average Fee Percent:</em> ${averageFeePercent}%`;

    let scheduleButton = document.getElementById('scheduleButton');
    scheduleButton.style.display = "block";
    scheduleButton.dataset.aum = formatCurrency(amount);
    scheduleButton.dataset.fee = formatCurrency(totalFee);

    document.getElementById('divider').style.display = "block";

    feeCalculated = true;
}

function scheduleMeeting() {
    let amount = document.getElementById('scheduleButton').dataset.aum;
    let fee = document.getElementById('scheduleButton').dataset.fee;
    let url = `https://calendly.com/chris-k-6/30min?a1=I%20would%20like%20to%20discuss%20my%20investable%20assets%20of%20${encodeURIComponent(amount)}%20and%20annual%20fee%20of%20${encodeURIComponent(fee)}.`;
    window.open(url, '_blank');
}

function formatCurrency(amount) {
    return `$${parseFloat(amount).toLocaleString()}`;
}

function formatPercentage(rate) {
    return `${(rate * 100).toFixed(2)}%`;
}

