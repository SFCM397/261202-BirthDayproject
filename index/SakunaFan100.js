
/* =====================================
   さくなだふぁみりあ百人百色
   ===================================== */


/* 承認済みの参加者データ
   掲載を承認した人だけを登録してください
*/

/* Googleスプレッドシートから読み込む公開データ */
let fanMembers = [];

/* 自分のウェブアプリURLをここに貼り付ける */
const DATA_URL = "https://script.google.com/macros/s/AKfycbzT1SatctkNVNhOKX3AsSUuSX4cytM2ZTgVPMEO99uMMT98s7QCUwpjzaA6jiWv3-pR6A/exec";


/* 設定 */

const PICK_COUNT = 5;


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
    { label: "好きなカバー曲", key: "favoriteCoverSong" }
];



/* 前回のおすすめに表示した参加者 */

let previousPickIds = [];


/* 掲載承認済みの人だけを使用 */

let approvedMembers = [];

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




/* =====================================
   画像URLを安全に変換する
   ===================================== */

function safeImageURL(value) {

    try {

        // URLが空の場合
        const imageValue = String(value ?? "").trim();

        if (!imageValue) {
            return "";
        }

        const url = new URL(imageValue);

        // HTTPS・HTTP以外は使用しない
        if (
            url.protocol !== "https:" &&
            url.protocol !== "http:"
        ) {
            return "";
        }

        // Google Driveの画像URL
        if (
            url.hostname === "drive.google.com" ||
            url.hostname === "www.drive.google.com"
        ) {

            let fileId = url.searchParams.get("id");

            // /file/d/ID/view 形式
            if (!fileId) {

                const match = url.pathname.match(
                    /\/file\/d\/([^/]+)/
                );

                if (match) {
                    fileId = match[1];
                }

            }

            // ファイルIDが取得できた場合
            if (fileId) {

                return "https://drive.google.com/thumbnail?id="
                    + encodeURIComponent(fileId)
                    + "&sz=w1200";

            }

            return "";
        }

        // Google Drive以外は元のURLを使用
        return url.href;

    } catch (error) {

        console.error("画像URLの変換エラー:", error);

        return "";

    }

}





/* 手紙カードを作る */

function createLetter(member, clickable = false) {

    // 投稿画像のURLを確認
    const imageURL = safeImageURL(member.cuteMomentUrl);

    // 画像がある場合
    const image = imageURL
        ? `
            <img
    class="letter-photo-img"
    src="${escapeHTML(imageURL)}"
    alt="${escapeHTML(member.name)}さんの投稿画像"
    loading="lazy"
    onerror="this.style.display='none';"
>
        `
        : `
            <div class="letter-no-image">
                <span>🎀</span>
                <p>投稿画像はありません</p>
            </div>
        `;

    // カード上部の共通デザイン
    const preview = `
        <div class="letter-photo">
            ${image}

            <div class="letter-name">
                <span class="letter-name-icon">🐾</span>
                <span>${escapeHTML(member.name)} さん</span>
            </div>
        </div>

        <div class="letter-heading">
            <span class="letter-envelope">💌</span>
            <h3>さくなだふぁみりあからのお手紙</h3>
            <span class="letter-paw">🐾</span>
        </div>

        <div class="letter-end">
            <span class="letter-ribbon">🎀</span>
            <span>さくなだふぁみりあ</span>
            <span>🐾</span>
        </div>
    `;

    // 一覧をクリックしたときに開く回答内容
    const questions = [
        ["お気に入り配信", member.favoriteStream],
        ["さくたんの好きなところ", member.favoritePart],
        ["結城さくなを一言で表すと", member.oneWord],
        ["好きな衣装", member.favoriteOutfit],
        ["好きなグッズ", member.favoriteGoods],
        ["一緒に1日過ごすなら", member.dayPlan],
        ["好きなカバー曲", member.favoriteCoverSong]
    ];

    const answers = questions
        .filter(([title, answer]) => String(answer ?? "").trim() !== "")
        .map(([title, answer]) => `
    <div class="letter-answer">
        <h4>${escapeHTML(title)}</h4>
        <p>${escapeHTML(String(answer).trim())}</p>
    </div>
`)
        .join("");

    // おすすめ欄は画像と名前だけ表示
    if (!clickable) {
        return `
            <article class="fan-letter">
                ${preview}
            </article>
        `;
    }

    // 一覧はクリックすると回答内容を展開
    return `
    <details class="fan-letter fan-letter-expand">

        <summary class="fan-letter-summary">

            <!-- 全画面表示を閉じる案内 -->
            <div class="letter-close-guide">
                × 閉じて一覧に戻る
            </div>

            ${preview}

            <div class="letter-open-guide">
                <span class="letter-open-text">お手紙を読む</span>
                <span class="letter-open-icon">▼</span>
            </div>

        </summary>

        <div class="letter-details">
            ${answers || `
                <p class="empty-message">
                    回答内容はありません。
                </p>
            `}
        </div>

    </details>
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
                おすすめのさくなだふぁみりあは準備中です。<br>
                みんなの「好き」が集まるまで待っていてね！🎀
            </p>
        `;
        return;
    }

    const selected = selectRecommendedMembers();

    todayPick.innerHTML = selected
        .map(member => createLetter(member, true))
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
        resultCount.textContent = "掲載中のさくなだふぁみりあ：0人";

        fanList.innerHTML = `
            <p class="empty-message">
                まだ掲載されているお手紙はありません。<br>
                参加者の承認後、ここにカードが並びます！🎀
            </p>
        `;
        return;
    }

    // 検索バーに入力された名前を取得
    const searchInput = document.getElementById("fan-name-search");

    const searchWord = searchInput
        ? searchInput.value.trim().toLocaleLowerCase()
        : "";

    // カテゴリーで絞り込む
    const categoryFiltered = categoryKey === "all"
        ? approvedMembers
        : approvedMembers.filter(member => {
            return String(member[categoryKey] ?? "").trim() !== "";
        });

    // 名前で絞り込む
    const filtered = categoryFiltered.filter(member => {
        const name = String(member.name ?? "").toLocaleLowerCase();

        return name.includes(searchWord);
    });


    // 表示人数を更新
    if (categoryKey === "all") {
        resultCount.textContent =
            `掲載中のさくなだふぁみりあ：${filtered.length}人`;
    } else {
        const selectedCategory = categories.find(
            category => category.key === categoryKey
        );

        resultCount.textContent =
            `${selectedCategory.label}の回答：${filtered.length}人`;
    }

    // 該当する回答がない場合
    if (filtered.length === 0) {

        fanList.innerHTML = `
        <p class="empty-message">
            ${searchWord
                ? "該当するふぁみりあが見つかりませんでした。🐾"
                : "このカテゴリーには、まだ回答がありません。"
            }
        </p>
    `;

        return;
    }

    // 「すべて」は今までどおり手紙カードを表示
    if (categoryKey === "all") {
        fanList.innerHTML = filtered
            .map(member => createLetter(member, true))
            .join("");

        return;
    }



    // カテゴリーを選択した場合は回答一覧を表示
    fanList.innerHTML = `
        <div class="answer-list">
            ${filtered.map(member => `
                <article class="answer-list-item">

                    <button
                        type="button"
                        class="answer-list-name answer-list-open"
                    >
                        🐾 ${escapeHTML(member.name)} さん
                    </button>

                    <p class="answer-list-text">${escapeHTML(
        String(member[categoryKey] ?? "")
            .replace(/^[\t \u3000]+|[\t \u3000]+$/gm, "")
    )}</p>

                    <div class="answer-list-letter">
                        ${createLetter(member, true)}
                    </div>

                </article>
            `).join("")}
        </div>
    `;
}



/* カテゴリーボタンの操作 */


function setupCategoryButtons() {
    if (!categoryButtons) return;

    // カテゴリーボタンの操作
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

    // 名前検索の操作
    const nameSearch = document.getElementById("fan-name-search");

    if (nameSearch) {

        nameSearch.addEventListener("input", () => {

            // 現在選択されているカテゴリーを取得
            const activeButton = categoryButtons.querySelector(
                ".filter-button.active"
            );

            const currentCategory = activeButton
                ? activeButton.dataset.category
                : "all";

            // 検索結果を更新
            showFanList(currentCategory);

        });

    }

    // 回答一覧の名前をクリックしたとき
    if (fanList) {
        fanList.addEventListener("click", event => {

            const button = event.target.closest(".answer-list-open");

            if (!button) return;

            const item = button.closest(".answer-list-item");

            if (!item) return;

            const letter = item.querySelector(".fan-letter-expand");

            if (letter) {
                letter.open = true;
            }
        });
    }
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


}


/* スプレッドシートから承認済みデータを読み込む */
async function loadFanMembers() {
    const list = document.getElementById("fan-list");

    try {
        const response = await fetch(DATA_URL);

        if (!response.ok) {
            throw new Error("データの取得に失敗しました");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("データ形式が正しくありません");
        }

        // 承認済みの回答だけを表示対象にする
        fanMembers = data.filter(member => member.approved === true);

        // 表示に使う参加者データをランダムに並べ替える
        approvedMembers = shuffleMembers(fanMembers);

        // 読み込み後、既存の表示処理を実行
        initFanPage();
    } catch (error) {
        console.error("ファンデータの読み込みエラー:", error);

        if (list) {
            list.innerHTML =
                '<p class="empty-message">データを読み込めませんでした。時間をおいて再度お試しください。</p>';
        }
    }
}


/* HTMLの読み込みが終わったら開始 */

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadFanMembers);
} else {
    loadFanMembers();
}


/* ==============================
   ページ上部へ戻る機能
============================== */

document.addEventListener("DOMContentLoaded", () => {

    const backToTop = document.getElementById("back-to-top");

    // ボタンが存在しない場合は終了
    if (!backToTop) return;

    // スクロール停止を判定するタイマー
    let scrollTimer = null;

    // スクロール中かどうか
    let isScrolling = false;

    // スクロール中の処理
    window.addEventListener("scroll", () => {

        // スクロール中にする
        isScrolling = true;

        // ボタンを非表示にする
        backToTop.classList.remove("is-visible");

        // 前のタイマーを解除
        clearTimeout(scrollTimer);

        // スクロールが止まってから0.6秒後に実行
        scrollTimer = setTimeout(() => {

            isScrolling = false;

            // 300px以上スクロールしていれば表示
            if (window.scrollY > 300) {
                backToTop.classList.add("is-visible");
            }

        }, 600);

    }, { passive: true });

    // ボタンを押したとき
    backToTop.addEventListener("click", () => {

        // スクロール中は反応させない
        if (isScrolling) return;

        // 最上部へ移動
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        // ボタンを非表示にする
        backToTop.classList.remove("is-visible");

    });

});
