class GachaGame {
    constructor() {
        this.counter = 0;
        this.my_gacha = { SSR: 0, SR: 0, R: 0, Ampas: 0 };

        this.totalSpent = 0;
        this.balance = 0;
        this.characters = {
            SSR: [
                { name: "Bocchi Maid", img: "img_1/bocchi_maid.jpg" },
                { name: "Power", img: "img_1/power.jpg" },
                { name: "Alya Wedding", img: "img_1/alya_wedding.jpg" }
            ],
            SR: [
                { name: "Bocchi", img: "img_1/bocchi.jpg" },
                { name: "Destiny", img: "img_1/destiny.jpg" },
                { name: "Who,s Rem?", img: "img_1/rem.jpg"}
            ],
            R: [
                { name: "Makima", img: "img_1/makima.jpg" },
                { name: "Pelakor", img: "img_1/pelakor.jpg" },
                { name: "Elaina", img: "img_1/elaina.jpg"},
                { name: "Masha", img: "img_1/masha.jpg"}
            ],
            Ampas: [
                { name: "Wiz Xmas", img: "img_1/wiz.jpg" },
                { name: "Anna", img: "img_1/anna.jpg" },
                { name: "Anya", img: "img_1/anya.jpg"},
                { name: "Zero two", img: "img_1/zero_two.jpg"}
            ]
        };
    }

    calculateProbability() {
        if (this.counter < 31) return 0.05;
        if (this.counter < 70) return 0.06;
        if (this.counter < 90) return 0.08;
        return 0.13;
    }

    roll(pityMultiplier) {
        const kemungkinan = 1 - (pityMultiplier * Math.floor(Math.random() * 10 + 1));
        if (kemungkinan <= 0.1) return "SSR";
        if (kemungkinan <= 0.3) return "SR";
        if (kemungkinan <= 0.6) return "R";
        return "Ampas";
    }

    async playGacha(howMuch) {
        const cost = howMuch === 1 ? 2.3 : 20.7;
        if (this.balance < cost) {
            this.showNotification("Top up dulu le ", "error");
            return;
        }
        
        this.balance -= cost;
        this.totalSpent += cost;
        this.updateBalance();
        this.playPullSFX();

        for (let i = 0; i < howMuch; i++) {
            const pityMultiplier = this.calculateProbability();
            const result = this.roll(pityMultiplier);
            this.my_gacha[result]++;
            this.counter++;

            const characters = this.characters[result];
            const character = characters[Math.floor(Math.random() * characters.length)];
            
            this.addResultToDOM(result, character);
            await new Promise(resolve => setTimeout(resolve, 300));

            if (result === 'SSR') {
                this.playSSRSFX();
                this.showNotification();
                this.counter = Math.max(0, this.counter - Math.min(this.counter, 100));
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            this.updateCounter();
            await new Promise(resolve => setTimeout(resolve, 200)); // Delay antar pull
        }

        if (this.counter >= 100) {
            this.my_gacha.SSR++;
            this.counter -= 100;
            const character = this.characters.SSR[Math.floor(Math.random() * this.characters.SSR.length)];
            this.addResultToDOM('SSR', character);
            this.showNotification("🎉 SSR Guaranteed! 🎉");
            this.updateCounter();
        }

        this.updateStats();
    }

    addResultToDOM(result, character) {
        const resultsGrid = document.getElementById('results');
        const card = document.createElement('div');
        card.className = `result-card ${result}`;
        
        card.innerHTML = `
            <img src="${character.img}" alt="${character.name}">
            <div class="character-name">${character.name}</div>
            <div class="rarity">${result}</div>
        `;
        
        resultsGrid.prepend(card);
    }

    updateCounter() {
        document.getElementById('counter').textContent = this.counter;
    }

    updateBalance() {
        document.getElementById('balance').textContent = this.balance.toFixed(2);
        document.getElementById('totalSpent').textContent = this.totalSpent.toFixed(2);
    }

    playPullSFX() {
        const sfx = document.getElementById('pullSFX');
        sfx.currentTime = 0;
        sfx.play();
    }

    playSSRSFX() {
        const sfx = document.getElementById('ssrSFX');
        sfx.currentTime = 0;
        sfx.play();
    }

    updateStats() {
        const statsDiv = document.getElementById('stats');
        statsDiv.innerHTML = `
            <h3>Total Results:</h3>
            <p>SSR: ${this.my_gacha.SSR} | SR: ${this.my_gacha.SR}<br>
            R: ${this.my_gacha.R} | Ampas: ${this.my_gacha.Ampas}</p>
        `;
    }

    showNotification(message = "🎉 Dapat SSR! 🎉") {
        const notification = document.getElementById('ssrNotification');
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }

    clearHistory() {
        this.my_gacha = { SSR: 0, SR: 0, R: 0, Ampas: 0 };
        this.counter = 0;
        document.getElementById('results').innerHTML = '';
        this.updateStats();
        this.updateCounter();
    }

    addBalance() {
        const amount = parseFloat(prompt("Enter amount to add:"));
        if (!isNaN(amount) && amount > 0) {
            this.balance += amount;
            this.updateBalance();
        } else {
            this.showNotification("Invalid amount!", "error");
        }
    }
}

const game = new GachaGame();

async function pull(amount) {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = true);

    await game.playGacha(amount);

    buttons.forEach(btn => btn.disabled = false);
}

function clearHistory() {
    game.clearHistory();
}

function addBalance() {
    game.addBalance();
}
