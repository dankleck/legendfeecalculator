let feeVisible = false;
let feeCalculated = false; 

document.getElementById('aumSlider').addEventListener('input', function() {
    let aumValue = this.value;
    this.step = aumValue < 1000000 ? 5000 : 10000;
    document.getElementById('aum').value = formatCurrency(aumValue);
    if (feeCalculated) calculateFee();
});

document.getElementById('aum').addEventListener('input', function() {
    formatCurrencyInput();
    let aumValue = parseFloat(this.value.replace(/[^0-9]/g, ''));
    if (!isNaN(aumValue)) {
        document.getElementById('aumSlider').value = aumValue;
    }
    if (feeCalculated) calculateFee();
});

function formatCurrencyInput() {
    let input = document.getElementById('aum');
    let rawValue = input.value.replace(/[^0-9]/g, '');
    if (rawValue) input.value = formatCurrency(rawValue);
}

function setAUM(amount) {
    document.getElementById('aum').value = formatCurrency(amount);
    document.getElementById('aumSlider').value = amount;
    if (feeCalculated) calculateFee();
}

function calculateFee() {
    let amount = parseFloat(document.getElementById('aum').value.replace(/[^0-9]/g, ''));
    if (isNaN(amount) || amount < 250000) {
        document.getElementById('feeOutput').innerText = "Invalid input";
        return;
    }

    let totalFee = 0, remaining = amount;
    const tiers = [
        { limit: 500000, rate: 0.009 },
        { limit: 1000000, rate: 0.0085 },
        { limit: 2000000, rate: 0.0075 },
        { limit: 5000000, rate: 0.005 },
        { limit: Infinity, rate: 0.0025 },
    ];

    let previousLimit = 0;
    for (let tier of tiers) {
        if (remaining <= 0) break;
        let taxableAmount = Math.min(remaining, tier.limit - previousLimit);
        totalFee += taxableAmount * tier.rate;
        remaining -= taxableAmount;
        previousLimit = tier.limit;
    }

    totalFee = Math.max(totalFee, 3000).toFixed(2);
    document.getElementById('feeOutput').innerText = `Annual Fee: ${formatCurrency(totalFee)}`;
    document.getElementById('scheduleButton').style.display = "block";
    document.getElementById('divider').style.display = "block";
    document.getElementById('pdfLink').style.display = 'block';
    feeCalculated = true;
}

function scheduleMeeting() {
    let amount = document.getElementById('scheduleButton').dataset.aum;
    let fee = document.getElementById('scheduleButton').dataset.fee;
    let url = `https://calendly.com/chris-k-6/30min?a1=Investable Assets: ${amount}, Annual Fee: ${fee}`;
    window.open(url, '_blank');
}

function formatCurrency(amount) {
    return `$${parseFloat(amount).toLocaleString()}`;
}

function formatPercentage(rate) {
    return `${(rate * 100).toFixed(2)}%`;
}
