
/* =====================================
   さくなだふぁみりあ百人百色
   ===================================== */


/* 承認済みの参加者データ
   掲載を承認した人だけを登録してください
*/

const fanMembers = [

    /*
    // 登録例：実際の参加者データに置き換えて使います

    {
        id: 1,
        approved: true,
        name: "ニックネーム",
        favoriteStream: "お気に入りの配信",
        favoritePart: "さくたんの好きなところ",
        oneWord: "一言で表すと",
        favoriteOutfit: "好きな衣装",
        favoriteGoods: "好きなグッズ",
        dayPlan: "一緒に1日過ごすなら",
        favoriteCoverSong: "好きなカバー曲",
        cuteMoment: "かわいい瞬間について",
        cuteMomentUrl: ""
    }
    */

];


/* 設定 */

const PICK_COUNT = 5;

// おすすめカードの切り替え間隔（8秒）
const CHANGE_INTERVAL = 8000;


/* HTMLの表示場所 */

const todayPick = document.getElementById("today-pick");
const randomButton = document.getElementById("random-button");
const randomResult = document.getElementById("random-result");
const categoryButtons = document.getElementById("category-buttons");
const resultCount = document.getElementById("result-count");
const fanList = document.getElementById("fan-list");


/* カテゴリー設定 */

const categories = [
    { label: "すべて", key: "all" },
    { label: "お気に入り配信", key: "favoriteStream" },
    { label: "好きなところ", key: "favoritePart" },
    { label: "一言で表すと", key: "oneWord" },
    { label: "好きな衣装", key: "favoriteOutfit" },
    { label: "好きなグッズ", key: "favoriteGoods" },
    { label: "1日一緒に過ごすなら", key: "dayPlan" },
    { label: "好きなカバー曲", key: "favoriteCoverSong" },
    { label: "かわいい瞬間", key: "cuteMoment" }
];


/* 前回のおすすめに表示した参加者 */

let previousPickIds = [];


/* 掲載承認済みの人だけを使用 */

const approvedMembers = fanMembers.filter(member => {
    return member.approved === true;
});


/* HTMLに表示する文字を安全にする */

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[char];
    });
}


/* 画像URLを確認する */

function safeImageURL(value) {
    try {
        const url = new URL(String(value ?? ""));

        if (url.protocol === "https:" || url.protocol === "http:") {
            return url.href;
        }
    } catch (error) {
        // URLとして使えない場合は画像を表示しない
    }

    return "";
}


/* 手紙の中身を作る */

function createLetter(member) {
    const questions = [
        ["お気に入り配信", member.favoriteStream],
        ["さくたんの好きなところ", member.favoritePart],
        ["結城さくなを一言で表すと", member.oneWord],
        ["好きな衣装", member.favoriteOutfit],
        ["好きなグッズ", member.favoriteGoods],
        ["一緒に1日過ごすなら", member.dayPlan],
        ["好きなカバー曲", member.favoriteCoverSong],
        ["さくたんのかわいい瞬間", member.cuteMoment]
    ];

    const answers = questions
        .filter(([title, answer]) => String(answer ?? "").trim() !== "")
        .map(([title, answer]) => `
            <div class="letter-answer">
                <h4>${escapeHTML(title)}</h4>
                <p>${escapeHTML(answer)}</p>
            </div>
        `)
        .join("");

    const imageURL = safeImageURL(member.cuteMomentUrl);

    const image = imageURL
        ? `
            <div class="letter-image">
                <h4>思い出の画像</h4>
                <a href="${escapeHTML(imageURL)}"
                   target="_blank"
                   rel="noopener noreferrer">
                    画像を開く
                </a>
            </div>
        `
        : "";

    return `
        <article class="fan-letter">

            <div class="letter-top">
                <span class="letter-icon">✉️</span>
                <span class="letter-label">ふぁみりあからのお手紙</span>
            </div>

            <h3 class="letter-name">
                ${escapeHTML(member.name)}
                <span>さん</span>
            </h3>

            <div class="letter-body">
                ${answers || "<p>お手紙の準備中です。</p>"}
                ${image}
            </div>

            <p class="letter-end">🎀 あなたの「好き」をありがとう 🐾</p>

        </article>
    `;
}


/* ランダムに並べ替える */

function shuffleMembers(members) {
    const result = [...members];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


/* おすすめの5人を選ぶ */

function selectRecommendedMembers() {
    const newMembers = approvedMembers.filter(member => {
        return !previousPickIds.includes(member.id);
    });

    const oldMembers = approvedMembers.filter(member => {
        return previousPickIds.includes(member.id);
    });

    const candidates = [
        ...shuffleMembers(newMembers),
        ...shuffleMembers(oldMembers)
    ];

    return candidates.slice(0, PICK_COUNT);
}


/* おすすめ5人を表示する */

function showRecommendedMembers() {
    if (!todayPick) return;

    if (approvedMembers.length === 0) {
        todayPick.innerHTML = `
            <p class="empty-message">
                おすすめのふぁみりあは準備中です。<br>
                みんなの「好き」が集まるまで待っていてね！🎀
            </p>
        `;
        return;
    }

    const selected = selectRecommendedMembers();

    todayPick.innerHTML = selected
        .map(member => createLetter(member))
        .join("");

    previousPickIds = selected.map(member => member.id);
}


/* ランダムに1人のお手紙を表示する */

function showRandomMember() {
    if (!randomResult) return;

    if (approvedMembers.length === 0) {
        randomResult.innerHTML = `
            <p class="empty-message">
                まだ掲載されているお手紙はありません。<br>
                これから少しずつ増えていく予定です！🐾
            </p>
        `;
        return;
    }

    const member = shuffleMembers(approvedMembers)[0];

    randomResult.innerHTML = createLetter(member);
}


/* カテゴリーボタンを作る */

function createCategoryButtons() {
    if (!categoryButtons) return;

    if (approvedMembers.length === 0) {
        categoryButtons.innerHTML = "";
        return;
    }

    categoryButtons.innerHTML = categories.map((category, index) => `
        <button
            type="button"
            class="filter-button ${index === 0 ? "active" : ""}"
            data-category="${category.key}"
            aria-pressed="${index === 0 ? "true" : "false"}"
        >
            ${category.label}
        </button>
    `).join("");
}


/* 一覧カードを表示する */

function showFanList(categoryKey = "all") {
    if (!fanList || !resultCount) return;

    if (approvedMembers.length === 0) {
        resultCount.textContent = "掲載中のふぁみりあ：0人";

        fanList.innerHTML = `
            <p class="empty-message">
                まだ掲載されているお手紙はありません。<br>
                参加者の承認後、ここにカードが並びます！🎀
            </p>
        `;
        return;
    }

    const filtered = categoryKey === "all"
        ? approvedMembers
        : approvedMembers.filter(member => {
            return String(member[categoryKey] ?? "").trim() !== "";
        });

    resultCount.textContent =
        `掲載中のふぁみりあ：${filtered.length}人`;

    if (filtered.length === 0) {
        fanList.innerHTML = `
            <p class="empty-message">
                このカテゴリーには、まだお手紙がありません。
            </p>
        `;
        return;
    }

    fanList.innerHTML = filtered
        .map(member => createLetter(member))
        .join("");
}


/* カテゴリーボタンの操作 */

function setupCategoryButtons() {
    if (!categoryButtons) return;

    categoryButtons.addEventListener("click", event => {
        const button = event.target.closest(".filter-button");

        if (!button) return;

        categoryButtons.querySelectorAll(".filter-button").forEach(item => {
            const active = item === button;

            item.classList.toggle("active", active);
            item.setAttribute("aria-pressed", String(active));
        });

        showFanList(button.dataset.category);
    });
}


/* ページの初期設定 */

function initFanPage() {
    showRecommendedMembers();
    showFanList();

    createCategoryButtons();
    setupCategoryButtons();

    if (randomButton) {
        randomButton.addEventListener("click", showRandomMember);
    }

    // 6人以上いるとき、おすすめ5人を8秒ごとに切り替える
    if (approvedMembers.length > PICK_COUNT) {
        setInterval(showRecommendedMembers, CHANGE_INTERVAL);
    }
}


/* HTMLの読み込みが終わったら開始 */

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFanPage);
} else {
    initFanPage();
}
