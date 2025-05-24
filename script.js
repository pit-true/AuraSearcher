// ========================
// 1. グローバル変数定義
// ========================

// 基本データ
let pokemonData = [];
let allPokemonData = [];
let moveData = [];
let typeMultiplierData = [];
let itemData = [];
let natureData = [];

// ポケモン情報
let currentPokemonName = "";
let currentPokemonMoves = [];
let currentOrigin = "";
let currentMyPokemonName = "";
let currentMyPokemonTypes = [];
let currentItem = null;

// 能力値情報
let baseStats = { hp: 0, a: 0, b: 0, c: 0, d: 0, s: 0 };
let natureModifiers = { a: 1.0, b: 1.0, c: 1.0, d: 1.0, s: 1.0 };
let ivValues = { hp: 31, a: 31, b: 31, c: 31, d: 31, s: 31 };

// レベル補正情報
let currentAddLevel = 0;
let hasAddLevel = false;

// 絞り込み用データ
let physicalRangeMin = 0;      // 物理の累積最小攻撃値
let physicalRangeMax = 999;    // 物理の累積最大攻撃値
let specialRangeMin = 0;       // 特殊の累積最小攻撃値
let specialRangeMax = 999;     // 特殊の累積最大攻撃値
let isTrackingEnabled = true;  // 絞り込み機能が有効かどうか

// 下位互換性のための変数
let cumulativeMinAtk = 0;
let cumulativeMaxAtk = 999;

// 性格データ定義
const natureDataList = [
  { "name": "ひかえめ", "c": 1.1, "a": 0.9 },
  { "name": "おくびょう", "s": 1.1, "a": 0.9 },
  { "name": "いじっぱり", "a": 1.1, "c": 0.9 },
  { "name": "ようき", "s": 1.1, "c": 0.9 },
  { "name": "ずぶとい", "b": 1.1, "a": 0.9 },
  { "name": "おだやか", "d": 1.1, "a": 0.9 },
  { "name": "わんぱく", "b": 1.1, "c": 0.9 },
  { "name": "しんちょう", "d": 1.1, "c": 0.9 },
  { "name": "れいせい", "c": 1.1, "s": 0.9 },
  { "name": "ゆうかん", "a": 1.1, "s": 0.9 },
  { "name": "なまいき", "d": 1.1, "s": 0.9 },
  { "name": "むじゃき", "s": 1.1, "d": 0.9 },
  { "name": "せっかち", "s": 1.1, "b": 0.9 },
  { "name": "さみしがり", "a": 1.1, "b": 0.9 },
  { "name": "やんちゃ", "a": 1.1, "d": 0.9 },
  { "name": "のうてんき", "b": 1.1, "d": 0.9 },
  { "name": "のんき", "b": 1.1, "s": 0.9 },
  { "name": "おっとり", "c": 1.1, "b": 0.9 },
  { "name": "うっかりや", "c": 1.1, "d": 0.9 },
  { "name": "おとなしい", "d": 1.1, "b": 0.9 },
  { "name": "まじめ", "a": 1.0, "b": 1.0, "c": 1.0, "d": 1.0, "s": 1.0 },
  { "name": "てれや", "a": 1.0, "b": 1.0, "c": 1.0, "d": 1.0, "s": 1.0 },
  { "name": "がんばりや", "a": 1.0, "b": 1.0, "c": 1.0, "d": 1.0, "s": 1.0 },
  { "name": "すなお", "a": 1.0, "b": 1.0, "c": 1.0, "d": 1.0, "s": 1.0 },
  { "name": "きまぐれ", "a": 1.0, "b": 1.0, "c": 1.0, "d": 1.0, "s": 1.0 }
];

// バッジ補正用 バッジ補正はNPCはかからずプレイヤーのみにかかるため
let isPlayerAttack = false;

// ========================
// 2. 初期化と設定
// ========================

// ページロード時の初期化関数を修正
document.addEventListener('DOMContentLoaded', function() {
  loadPokemonData();
  loadAllPokemonData();
  loadMoveData();
  loadTypeMultiplierData();
  loadNatureData();
  loadItemData();
  initializeMoveDropdown();
  initializeItemDropdown();
  setupSpeedValueMonitoring();
  setupDefPokemonInputMonitoring();
  initializeNatureCheckboxes();
  initializeEstimateButton();
  initializeTripleKickButtons();
  // 既存のイベントリスナーを設定
  document.getElementById('searchPokemon').addEventListener('click', function() {
    // クリックしたときの処理はカスタム検索で処理
  });
  
  document.getElementById('searchMyPokemon').addEventListener('click', function() {
    // クリックしたときの処理はカスタム検索で処理
  });
  
  document.getElementById('searchNature').addEventListener('click', showAllNatures);
  document.getElementById('searchNature').addEventListener('input', selectNature);
  
  // モバイル判定関数をグローバルに定義（複数の場所から参照されるため）
  window.isMobile = function() {
    return window.innerWidth <= 480; // 480px以下をモバイルとみなす
  };
  
  // カスタム検索機能を初期化
  implementCustomSearch();
  
  // 初期状態設定
  document.querySelector('.moves-container').style.display = 'none';
  document.querySelector('.damage-estimate-container').style.display = 'none';
  document.getElementById('searchNature').value = "まじめ";
  document.querySelector('.spdBadgeBoostContainer').style.display = 'none';
  document.getElementById('burnCheck').closest('label').style.display = 'none';
  document.querySelector('.pinchUpContainer').style.display = 'none';
  document.querySelector('.pinchUp2Container').style.display = 'none';
  document.querySelector('.tripleKickContainer').style.display = 'none';
  document.querySelector('.sutemiTackleContainer').style.display = 'none';
  selectNature();
  
  // タイプ相性データを先に読み込む
  fetch('type_multiplier.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`JSON読み込みエラー: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      window.typeMultiplierData = data;
    })
    .catch(error => {
      console.error("タイプ相性データの読み込みに失敗:", error);
    });

  // 被ダメ計算ボタンの初期化を最後に実行
  setTimeout(function() {
    // すべてのHTML初期化が終わった後で実行
    const estimateButton = document.getElementById('estimateIvButton');
    if (!estimateButton) {
      console.log('estimateIvButton要素が見つかりません');
      return;
    }
    
    // HTML属性とイベントリスナーをクリアするためにクローン作成
    const newButton = estimateButton.cloneNode(false); // 属性のみコピー
    newButton.textContent = estimateButton.textContent || '被ダメから個体値推定';
    newButton.removeAttribute('onclick');
    newButton.id = 'estimateIvButton'; // IDを維持
    newButton.className = estimateButton.className; // クラスを維持
    
    // 新しいボタンで古いボタンを置き換え
    if (estimateButton.parentNode) {
      estimateButton.parentNode.replaceChild(newButton, estimateButton);
      //console.log('ボタン要素の置き換えに成功しました');
    } else {
      console.log('ボタンの親要素が見つかりません');
      return;
    }
    
    // 単一のイベントリスナーを設定
    newButton.addEventListener('click', function(e) {
      
      // イベントの複数回発火を防止
      e.stopPropagation();
      
      // 関数を1回だけ実行
      if (typeof window.estimateIVFromDamage === 'function') {
        window.estimateIVFromDamage();
      } else {
        console.error('estimateIVFromDamage関数が見つかりません');
      }
      
      // モバイルデバイスの場合は結果セクションまでスクロール
      if (window.isMobile && window.isMobile()) {
        setTimeout(function() {
          if (window.scrollToSection) {
            window.scrollToSection('resultSection');
          }
        }, 300);
      }
    });
    
    // チェックボックスの初期化
    if (typeof initializeTrackingCheckbox === 'function') {
      initializeTrackingCheckbox();
    }

  }, 500); // DOMContentLoadedイベント後に少し遅延させて実行
});

// ========================
// 3. データロード関数
// ========================

// 相手ポケモンデータの読み込み
async function loadPokemonData() {
  const response = await fetch('encounter_pokemon_data.json');
  const data = await response.json();
  pokemonData = Array.isArray(data) ? data : [data];
  populatePokemonList();
}

// 全ポケモンデータの読み込み
async function loadAllPokemonData() {
  const response = await fetch('all_pokemon_data.json');
  const data = await response.json();
  allPokemonData = Array.isArray(data) ? data : [data];
}

// わざデータの読み込み
async function loadMoveData() {
  const response = await fetch('pokemon_moves.json');
  const data = await response.json();
  moveData = Array.isArray(data) ? data : [data];
}

// タイプ相性データの読み込み
async function loadTypeMultiplierData() {
  const response = await fetch('type_multiplier.json');
  const data = await response.json();
  typeMultiplierData = data;
}

// 性格データの読み込み
function loadNatureData() {
  natureData = natureDataList;
  populateNatureList();
}

// アイテムデータの読み込み
async function loadItemData() {
  const response = await fetch('item.json');
  const data = await response.json();
  itemData = Array.isArray(data) ? data : [data];
}


// 個体値推定ボタンのイベントハンドラを修正
function initializeEstimateButton() {
  const estimateButton = document.getElementById('estimateIvButton');
  if (!estimateButton) return;
  
  // 既存のイベントリスナーをクリア
  const newButton = estimateButton.cloneNode(true);
  estimateButton.parentNode.replaceChild(newButton, estimateButton);
  
  // 新しいイベントリスナーを設定
  newButton.addEventListener('click', function() {
    // 入力チェック
    const defPokemonInput = document.getElementById('searchDefPokemon');
    if (defPokemonInput && defPokemonInput.value) {
      // 最終チェック - 入力値に基づいてポケモンデータを更新
      const pokemonName = defPokemonInput.value;
      const exactMatch = allPokemonData.find(p => p.name === pokemonName);
      
      if (exactMatch) {
        // グローバル変数の更新
        if (typeof currentMyPokemonName !== 'undefined') {
          currentMyPokemonName = exactMatch.name;
        }
        
        if (typeof currentMyPokemonTypes !== 'undefined') {
          if (exactMatch.type) {
            currentMyPokemonTypes = Array.isArray(exactMatch.type) ? exactMatch.type : [exactMatch.type];
          } else {
            currentMyPokemonTypes = [];
          }
        }
      }
    }
    
    // 個体値推定関数を呼び出し
    if (typeof estimateIVFromDamage === 'function') {
      estimateIVFromDamage();
    }
  });
}

// トリプルキックボタンの初期化
function initializeTripleKickButtons() {
  const kickButtons = document.querySelectorAll('input[name="triple_kick"]');
  
  kickButtons.forEach(button => {
    button.addEventListener('change', function() {
      updateKickButtonStyles();
    });
  });
  
  // 初期状態のスタイルを設定
  updateKickButtonStyles();
}

function updateKickButtonStyles() {
  const kickButtons = document.querySelectorAll('input[name="triple_kick"]');
  
  kickButtons.forEach(button => {
    const label = document.querySelector(`label[for="${button.id}"]`);
    if (label) {
      if (button.checked) {
        label.classList.add('selected');
      } else {
        label.classList.remove('selected');
      }
    }
  });
}


// ========================
// 4. リスト表示関数
// ========================

// ポケモンリストを表示
function populatePokemonList() {
  const list = document.getElementById('pokemonList');
  if (!list) return;
  
  // データリストをクリア
  list.innerHTML = '';
  
  if (pokemonData && pokemonData.length > 0) {
    // 各ポケモンの名前とその変形を追加
    for (const pokemon of pokemonData) {
      if (pokemon.name) {
        // カタカナ名を追加
        let option = document.createElement('option');
        option.value = pokemon.name;
        list.appendChild(option);
        
        // ひらがな名があればそれも追加
        if (pokemon.hiragana) {
          option = document.createElement('option');
          option.value = pokemon.name; // valueはカタカナ名
          option.label = pokemon.hiragana; // 表示用ラベルはひらがな
          option.textContent = pokemon.hiragana; // テキストもひらがな
          list.appendChild(option);
        }
        
        // ローマ字名があればそれも追加
        if (pokemon.romaji) {
          option = document.createElement('option');
          option.value = pokemon.name; // valueはカタカナ名
          option.label = pokemon.romaji; // 表示用ラベルはローマ字
          option.textContent = pokemon.romaji; // テキストもローマ字
          list.appendChild(option);
        }
      }
    }
  }
}

// 性格リストを表示
function populateNatureList() {
  const list = document.getElementById('natureList');
  list.innerHTML = '';
  
  if (natureData && natureData.length > 0) {
    natureData.forEach(nature => {
      if (nature.name) {
        let option = document.createElement('option');
        option.value = nature.name;
        list.appendChild(option);
      }
    });
  }
}

// 技入力欄のドロップダウン機能実装
function initializeMoveDropdown() {
  
  // 技入力欄の取得
  const moveInput = document.getElementById('searchMyMove');
  if (!moveInput) {
    console.error('技入力欄が見つかりません');
    return;
  }
  
  // 既存のdatalist属性を削除
  if (moveInput.hasAttribute('list')) {
    moveInput.removeAttribute('list');
  }
  
  // ドロップダウンの作成（既存のものがあれば削除）
  let moveDropdown = document.getElementById('moveDropdown');
  if (moveDropdown) {
    moveDropdown.parentNode.removeChild(moveDropdown);
  }
  
  moveDropdown = document.createElement('div');
  moveDropdown.id = 'moveDropdown';
  moveDropdown.className = 'pokemon-dropdown';
  moveDropdown.style.position = 'absolute';
  moveDropdown.style.display = 'none';
  moveDropdown.style.zIndex = '1000';
  moveDropdown.style.backgroundColor = 'white';
  moveDropdown.style.border = '1px solid #ccc';
  moveDropdown.style.borderRadius = '4px';
  moveDropdown.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  moveDropdown.style.maxHeight = '250px';
  moveDropdown.style.overflowY = 'auto';
  
  // ドロップダウンをDOMに追加
  document.body.appendChild(moveDropdown);
  
  // クリックイベント - ここを修正して入力内容をクリアする
  moveInput.addEventListener('click', function(e) {
    e.stopPropagation();
    
    // 入力内容をクリア
    this.value = '';
    
    // ドロップダウンの内容をクリア
    moveDropdown.innerHTML = '';
    
    // 位置の設定
    const rect = this.getBoundingClientRect();
    moveDropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    moveDropdown.style.left = (rect.left + window.scrollX) + 'px';
    moveDropdown.style.width = rect.width + 'px';
    
    // moveDataを確認
    if (typeof moveData !== 'undefined' && moveData && moveData.length > 0) {
      // 最初の30件を表示
      const displayItems = moveData.slice(0, 30);
      
      if (displayItems.length > 0) {
        displayItems.forEach(function(move) {
          const item = document.createElement('div');
          item.className = 'dropdown-item';
          item.style.padding = '5px 8px';
          item.style.cursor = 'pointer';
          item.style.borderBottom = '1px solid #eee';
          item.style.fontSize = '14px';
          
          // 技名のみ表示
          item.textContent = move.name;
          
          // ホバー効果
          item.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#f0f0f0';
          });
          
          item.addEventListener('mouseout', function() {
            this.style.backgroundColor = 'transparent';
          });
          
          // クリックイベント
          item.addEventListener('click', function() {
            moveInput.value = move.name;
            moveDropdown.style.display = 'none';
            
            // 値変更後にchangeイベントを明示的に発火（inputは不要）
            moveInput.dispatchEvent(new Event('change', { bubbles: true }));
            
            // 直接効果を適用
            updateMoveUI(move.name);
          });
          
          moveDropdown.appendChild(item);
        });
        
        // 「もっと見る」オプション
        if (moveData.length > 30) {
          const moreItem = document.createElement('div');
          moreItem.className = 'dropdown-item';
          moreItem.style.padding = '5px 8px';
          moreItem.style.textAlign = 'center';
          moreItem.style.fontStyle = 'italic';
          moreItem.style.color = '#666';
          moreItem.style.fontSize = '12px';
          moreItem.textContent = '入力して絞り込み...';
          moveDropdown.appendChild(moreItem);
        }
      }
    } else {
      console.error('moveDataが見つかりません');
      const errorItem = document.createElement('div');
      errorItem.className = 'dropdown-item';
      errorItem.style.padding = '5px 8px';
      errorItem.style.color = 'red';
      errorItem.textContent = '技データが読み込まれていません';
      moveDropdown.appendChild(errorItem);
    }
    
    // ドロップダウンを表示
    moveDropdown.style.display = 'block';
  });
  
  // 残りのコードは変更なし（入力イベント、ドロップダウン外クリック処理など）
  // 入力イベント（フィルタリング）
  moveInput.addEventListener('input', function() {
    const searchText = this.value.toLowerCase();
    
    // 入力がなければドロップダウンを非表示
    if (!searchText) {
      moveDropdown.style.display = 'none';
      return;
    }
    
    // 技をフィルタリング
    if (typeof moveData !== 'undefined' && moveData && moveData.length > 0) {
      // ドロップダウンの内容をクリア
      moveDropdown.innerHTML = '';
      
      // カタカナとひらがなの変換関数
      const toHiragana = (text) => {
        return text.replace(/[\u30A1-\u30F6]/g, function(match) {
          return String.fromCharCode(match.charCodeAt(0) - 0x60);
        });
      };
      
      const toKatakana = (text) => {
        return text.replace(/[\u3041-\u3096]/g, function(match) {
          return String.fromCharCode(match.charCodeAt(0) + 0x60);
        });
      };
      
      // 検索テキストをひらがなとカタカナに変換
      const hiraganaText = toHiragana(searchText);
      const katakanaText = toKatakana(searchText);
      
      // 拡張フィルタリング (ひらがな・ローマ字対応)
      const filteredMoves = moveData.filter(function(move) {
        if (!move || !move.name) return false;
        
        // カタカナ名での検索 (先頭一致)
        const name = move.name.toLowerCase();
        if (name.startsWith(searchText) || 
            name.startsWith(hiraganaText) || 
            name.startsWith(katakanaText)) {
          return true;
        }
        
        // ひらがな名での検索
        if (move.hiragana) {
          const hiraganaName = move.hiragana.toLowerCase();
          if (hiraganaName.startsWith(searchText) || 
              hiraganaName.startsWith(hiraganaText)) {
            return true;
          }
        }
        
        // ローマ字での検索
        if (move.romaji) {
          const romajiName = move.romaji.toLowerCase();
          if (romajiName.startsWith(searchText)) {
            return true;
          }
        }
        
        return false;
      });
      
      // 最初の30件を表示
      const displayItems = filteredMoves.slice(0, 30);
      
      if (displayItems.length > 0) {
        displayItems.forEach(function(move) {
          const item = document.createElement('div');
          item.className = 'dropdown-item';
          item.style.padding = '5px 8px';
          item.style.cursor = 'pointer';
          item.style.borderBottom = '1px solid #eee';
          item.style.fontSize = '14px';
          
          // 技名のみ表示 (オリジナルのname)
          item.textContent = move.name;
          
          // ホバー効果
          item.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#f0f0f0';
          });
          
          item.addEventListener('mouseout', function() {
            this.style.backgroundColor = 'transparent';
          });
          
          // クリックイベント - 絞り込み後の候補用
          item.addEventListener('click', function() {
            // テキストボックスに技名を設定
            moveInput.value = move.name;
            moveDropdown.style.display = 'none';
            
            // 値変更後にchangeイベントを発火
            moveInput.dispatchEvent(new Event('change', { bubbles: true }));
            
            // 直接効果を適用
            updateMoveUI(move.name);
          });
          
          moveDropdown.appendChild(item);
        });
        
        // 「もっと見る」オプション
        if (filteredMoves.length > 30) {
          const moreItem = document.createElement('div');
          moreItem.className = 'dropdown-item';
          moreItem.style.padding = '5px 8px';
          moreItem.style.textAlign = 'center';
          moreItem.style.fontStyle = 'italic';
          moreItem.style.color = '#666';
          moreItem.style.fontSize = '12px';
          moreItem.textContent = 'さらに' + (filteredMoves.length - 30) + '件...';
          moveDropdown.appendChild(moreItem);
        }
      } else {
        // 検索結果がない場合
        const noResultItem = document.createElement('div');
        noResultItem.className = 'dropdown-item';
        noResultItem.style.padding = '5px 8px';
        noResultItem.style.fontStyle = 'italic';
        noResultItem.style.color = '#666';
        noResultItem.style.fontSize = '14px';
        noResultItem.textContent = '該当する技が見つかりません';
        moveDropdown.appendChild(noResultItem);
      }
      
      // ポジション更新
      const rect = this.getBoundingClientRect();
      moveDropdown.style.top = (rect.bottom + window.scrollY) + 'px';
      moveDropdown.style.left = (rect.left + window.scrollX) + 'px';
      moveDropdown.style.width = rect.width + 'px';
      
      // ドロップダウンを表示
      moveDropdown.style.display = 'block';
    }
  });
  
  // ドロップダウン以外をクリックしたらドロップダウンを閉じる
  document.addEventListener('click', function(e) {
    if (e.target !== moveInput && !moveDropdown.contains(e.target)) {
      moveDropdown.style.display = 'none';
    }
  });
  
  // changeイベントのリスナーを設定
  moveInput.addEventListener('change', function() {
    updateMoveUI(this.value);
  });
  
  
  // 入力内容に基づいてUI要素を更新する関数
  function updateMoveUI(moveName) {
    // この変数で重複実行を防止
    if (updateMoveUI.lastMoveName === moveName) {
      return; // 同じ技名の場合は処理をスキップ
    }
    
    // 現在の技名を記録
    updateMoveUI.lastMoveName = moveName;
    
    // 技情報を検索
    const moveInfo = moveData.find(m => m.name === moveName);
    
    if (moveInfo) {
      console.log('技情報:', moveInfo);
      
      // ダブルバトルチェックボックス処理の修正
      const doubleCheck = document.getElementById('doubleCheck');
      if (doubleCheck) {
        const doubleCheckContainer = document.querySelector('.doubleCheckContainer');
        // コンテナも表示/非表示を設定
        if (doubleCheckContainer) {
          if (moveInfo.target == 2) {
            doubleCheckContainer.style.display = 'block';
            doubleCheck.checked = true;
          } else {
            doubleCheckContainer.style.display = 'none';
            doubleCheck.checked = false;
          }
        }
      }
      
      //物理技のときやけどチェックボックス表示
      if (moveInfo.category == "Physical") {
        document.getElementById('burnCheck').closest('label').style.display = 'inline';
      } else {
        document.getElementById('burnCheck').closest('label').style.display = 'none';
      }
  
      // いたみわけの場合のラベル変更
      if (moveInfo.class === "itamiwake") {
        const atkLabel = document.querySelector('label[for="atk"]');
        if (atkLabel) {
          atkLabel.textContent = 'HP:';
          atkLabel.style.color = 'red';
        }
      } else {
        // それ以外の技の場合は元に戻す
        const atkLabel = document.querySelector('label[for="atk"]');
        if (atkLabel) {
          atkLabel.textContent = 'A/C(実数値):';
          atkLabel.style.color = '';
        }
      }

      // きしかいせい・じたばたのときHP入力テキストボックス表示
      if (moveInfo.class === "pinch_up") {
        document.querySelector('.pinchUpContainer').style.display = 'flex';
      } else {
        // それ以外の技の場合は元に戻す
        document.querySelector('.pinchUpContainer').style.display = 'none';
      }
      // すてみタックル(反動)のときHP入力テキストボックス表示
      if (moveInfo.class === "recoil") {
        document.querySelector('.sutemiTackleContainer').style.display = 'flex';
      } else {
        // それ以外の技の場合は元に戻す
        document.querySelector('.sutemiTackleContainer').style.display = 'none';
      }
    }
    
    // 少し遅延してから次の呼び出しを許可する（bounce防止）
    setTimeout(() => {
      updateMoveUI.lastMoveName = null;
    }, 200);
  }
  // 初期状態ではダブル半減チェックボックスを非表示に
  const doubleCheckContainer = document.querySelector('.doubleCheckContainer');
  if (doubleCheckContainer) {
    doubleCheckContainer.style.display = 'none';
  }
}

// 技入力欄のイベント監視を設定する関数
function setupMoveInputMonitoring() {
  const moveInput = document.getElementById('searchMyMove');
  if (!moveInput) return;
  
  // 入力内容が変わったときのイベント（直接入力とリスト選択の両方に対応）
  moveInput.addEventListener('change', updateMoveEffects);
  moveInput.addEventListener('input', updateMoveEffects);
  
  // 初期状態を確認
  updateMoveEffects();
  
  // 入力内容に基づいてUI要素を更新する関数
  function updateMoveEffects() {
    const moveName = moveInput.value;
    console.log('技名変更を検出:', moveName);
    
    // 技情報を検索
    const moveInfo = moveData.find(m => m.name === moveName);
    
    if (moveInfo) {
      console.log('技情報:', moveInfo);
      
      // ダブルバトルチェックボックス処理
      const doubleCheck = document.getElementById('doubleCheck');
      if (doubleCheck) {
        const doubleCheckLabel = doubleCheck.closest('label');
        if (doubleCheckLabel) {
          // target=2の場合は表示、それ以外は非表示
          if (moveInfo.target == 2) {
            doubleCheckLabel.style.display = 'inline';
            console.log('全体技なのでチェックボックスを表示');
          } else {
            doubleCheckLabel.style.display = 'none';
          }
        }
      }
    
    }
  }
}

// アイテムリストのドロップダウン機能
function initializeItemDropdown() {
  
  // アイテム入力欄の取得
  const itemInput = document.getElementById('searchItem');
  if (!itemInput) {
    console.error('持ち物入力欄が見つかりません');
    return;
  }
  
  // ドロップダウンの作成（既存のものがあれば削除）
  let itemDropdown = document.getElementById('itemDropdown');
  if (itemDropdown) {
    itemDropdown.parentNode.removeChild(itemDropdown);
  }
  
  itemDropdown = document.createElement('div');
  itemDropdown.id = 'itemDropdown';
  itemDropdown.className = 'pokemon-dropdown';
  itemDropdown.style.position = 'absolute';
  itemDropdown.style.display = 'none';
  itemDropdown.style.zIndex = '1000';
  itemDropdown.style.backgroundColor = 'white';
  itemDropdown.style.border = '1px solid #ccc';
  itemDropdown.style.borderRadius = '4px';
  itemDropdown.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  itemDropdown.style.maxHeight = '250px';
  itemDropdown.style.overflowY = 'auto';
  
  // ドロップダウンをDOMに追加
  document.body.appendChild(itemDropdown);
  
  // クリックイベント - ここを修正して入力内容をクリア
  itemInput.addEventListener('click', function(e) {
    e.stopPropagation();
    
    // 入力内容をクリア
    this.value = '';
    
    // ドロップダウンの内容をクリア
    itemDropdown.innerHTML = '';
    
    // 位置の設定
    const rect = this.getBoundingClientRect();
    itemDropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    itemDropdown.style.left = (rect.left + window.scrollX) + 'px';
    itemDropdown.style.width = rect.width + 'px';
    
    // itemDataを確認
    if (typeof itemData !== 'undefined' && itemData && itemData.length > 0) {
      // 全アイテムを表示
      itemData.forEach(function(item) {
        const itemElement = document.createElement('div');
        itemElement.className = 'dropdown-item';
        itemElement.style.padding = '5px 8px';
        itemElement.style.cursor = 'pointer';
        itemElement.style.borderBottom = '1px solid #eee';
        itemElement.style.fontSize = '14px';
        
        // アイテム名のみ表示
        itemElement.textContent = item.name;
        
        // ホバー効果
        itemElement.addEventListener('mouseover', function() {
          this.style.backgroundColor = '#f0f0f0';
        });
        
        itemElement.addEventListener('mouseout', function() {
          this.style.backgroundColor = 'transparent';
        });
        
        // クリックイベント
        itemElement.addEventListener('click', function() {
          itemInput.value = item.name;
          itemDropdown.style.display = 'none';
          
          // 値変更後にchangeイベントを発火
          itemInput.dispatchEvent(new Event('change', { bubbles: true }));
        });
        
        itemDropdown.appendChild(itemElement);
      });
    } else {
      console.error('itemDataが見つかりません');
      const errorItem = document.createElement('div');
      errorItem.className = 'dropdown-item';
      errorItem.style.padding = '5px 8px';
      errorItem.style.color = 'red';
      errorItem.textContent = 'アイテムデータが読み込まれていません';
      itemDropdown.appendChild(errorItem);
    }
    
    // ドロップダウンを表示
    itemDropdown.style.display = 'block';
  });
  
  // 入力イベント（フィルタリング） - アルファベット検索に対応
  itemInput.addEventListener('input', function() {
    const searchText = this.value.toLowerCase();
    
    // 入力がなければドロップダウンを非表示
    if (!searchText) {
      itemDropdown.style.display = 'none';
      return;
    }
    
    // カタカナとひらがなの変換関数
    const toHiragana = (text) => {
      return text.replace(/[\u30A1-\u30F6]/g, function(match) {
        return String.fromCharCode(match.charCodeAt(0) - 0x60);
      });
    };
    
    const toKatakana = (text) => {
      return text.replace(/[\u3041-\u3096]/g, function(match) {
        return String.fromCharCode(match.charCodeAt(0) + 0x60);
      });
    };
    
    // 検索テキストをひらがなとカタカナに変換
    const hiraganaText = toHiragana(searchText);
    const katakanaText = toKatakana(searchText);
    
    // アイテムをフィルタリング
    if (typeof itemData !== 'undefined' && itemData && itemData.length > 0) {
      // ドロップダウンの内容をクリア
      itemDropdown.innerHTML = '';
      
      // 拡張フィルタリング (ひらがな・ローマ字対応)
      const filteredItems = itemData.filter(function(item) {
        if (!item || !item.name) return false;
        
        // カタカナ名での検索 (先頭一致)
        const name = item.name.toLowerCase();
        if (name.startsWith(searchText) || 
            name.startsWith(hiraganaText) || 
            name.startsWith(katakanaText)) {
          return true;
        }
        
        // ひらがな名での検索
        if (item.hiragana) {
          const hiraganaName = item.hiragana.toLowerCase();
          if (hiraganaName.startsWith(searchText) || 
              hiraganaName.startsWith(hiraganaText)) {
            return true;
          }
        }
        
        // ローマ字での検索
        if (item.romaji) {
          const romajiName = item.romaji.toLowerCase();
          if (romajiName.startsWith(searchText)) {
            return true;
          }
        }
        
        return false;
      });
      
      if (filteredItems.length > 0) {
        filteredItems.forEach(function(item) {
          const itemElement = document.createElement('div');
          itemElement.className = 'dropdown-item';
          itemElement.style.padding = '5px 8px';
          itemElement.style.cursor = 'pointer';
          itemElement.style.borderBottom = '1px solid #eee';
          itemElement.style.fontSize = '14px';
          
          // アイテム名のみ表示
          itemElement.textContent = item.name;
          
          // ホバー効果
          itemElement.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#f0f0f0';
          });
          
          itemElement.addEventListener('mouseout', function() {
            this.style.backgroundColor = 'transparent';
          });
          
          // クリックイベント
          itemElement.addEventListener('click', function() {
            itemInput.value = item.name;
            itemDropdown.style.display = 'none';
            
            // 値変更後にchangeイベントを発火
            itemInput.dispatchEvent(new Event('change', { bubbles: true }));
          });
          
          itemDropdown.appendChild(itemElement);
        });
      } else {
        // 検索結果がない場合
        const noResultItem = document.createElement('div');
        noResultItem.className = 'dropdown-item';
        noResultItem.style.padding = '5px 8px';
        noResultItem.style.fontStyle = 'italic';
        noResultItem.style.color = '#666';
        noResultItem.style.fontSize = '14px';
        noResultItem.textContent = '該当するアイテムが見つかりません';
        itemDropdown.appendChild(noResultItem);
      }
      
      // ポジション更新
      const rect = this.getBoundingClientRect();
      itemDropdown.style.top = (rect.bottom + window.scrollY) + 'px';
      itemDropdown.style.left = (rect.left + window.scrollX) + 'px';
      itemDropdown.style.width = rect.width + 'px';
      
      // ドロップダウンを表示
      itemDropdown.style.display = 'block';
    }
  });
  
  // ドロップダウン以外をクリックしたらドロップダウンを閉じる
  document.addEventListener('click', function(e) {
    if (e.target !== itemInput && !itemDropdown.contains(e.target)) {
      itemDropdown.style.display = 'none';
    }
  });
}

// ドロップダウンメニューを更新する関数
function updatePokemonDropdown(inputText, dataSource, dropdown) {
  // 入力がなければドロップダウンを閉じる
  if (!inputText) {
    dropdown.style.display = 'none';
    return;
  }
  
  // 検索テキストを小文字に変換
  const searchText = inputText.toLowerCase();
  
  // カタカナとひらがなの変換
  const hiragana = searchText.replace(/[\u30A1-\u30F6]/g, function(match) {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
  
  const katakana = searchText.replace(/[\u3041-\u3096]/g, function(match) {
    return String.fromCharCode(match.charCodeAt(0) + 0x60);
  });
  
  // マッチするポケモンを検索
  const matches = [];
  dataSource.forEach(pokemon => {
    if (!pokemon.name) return;
    
    const name = pokemon.name.toLowerCase();
    const hiraganaName = (pokemon.hiragana || '').toLowerCase();
    const romajiName = (pokemon.romaji || '').toLowerCase();
    
    // 部分一致で検索
    if (name.includes(searchText) || 
        name.includes(hiragana) || 
        name.includes(katakana) || 
        hiraganaName.includes(searchText) || 
        hiraganaName.includes(hiragana) || 
        hiraganaName.includes(katakana) || 
        romajiName.includes(searchText)) {
      
      // 既に追加されていなければ追加
      if (!matches.find(m => m.name === pokemon.name)) {
        matches.push({
          name: pokemon.name,
          hiragana: pokemon.hiragana,
          romaji: pokemon.romaji
        });
      }
    }
  });
  
  // ドロップダウンの内容をクリア
  dropdown.innerHTML = '';
  
  // マッチしたポケモンがあればドロップダウンに追加
  if (matches.length > 0) {
    matches.forEach(pokemon => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      
      // ポケモン名と別名を表示（カタカナ、ひらがな、ローマ字）
      let displayText = pokemon.name;
      if (pokemon.hiragana) {
        displayText += ` (${pokemon.hiragana})`;
      }
      if (pokemon.romaji) {
        displayText += ` [${pokemon.romaji}]`;
      }
      
      item.textContent = displayText;
      
      // クリックイベントの設定
      item.addEventListener('click', function() {
        // 入力欄に名前をセット
        if (dropdown.id === 'pokemonSearchDropdown') {
          document.getElementById('searchPokemon').value = pokemon.name;
          selectPokemon();  // 既存の選択処理を呼び出す
        } else {
          document.getElementById('searchMyPokemon').value = pokemon.name;
          selectMyPokemon();  // 既存の選択処理を呼び出す
        }
    // どのドロップダウンかを判定
    if (dropdown.id === 'myPokemonSearchDropdown') {
      document.getElementById('searchMyPokemon').value = pokemon.name;
      selectMyPokemon();  // 既存の選択処理を呼び出す
    } else if (dropdown.id === 'defPokemonSearchDropdown') {
      document.getElementById('searchDefPokemon').value = pokemon.name;
      selectMyPokemon();  // 同じ処理を使用
    } else {
      document.getElementById('searchPokemon').value = pokemon.name;
      selectPokemon();  // 既存の選択処理を呼び出す
    }   
        // ドロップダウンを閉じる
        dropdown.style.display = 'none';
      });
      
      dropdown.appendChild(item);
    });
    
    // ドロップダウンを表示
    dropdown.style.display = 'block';
    
    // 位置調整（入力欄の下に表示）
    const inputRect = dropdown.previousElementSibling.getBoundingClientRect();
    dropdown.style.top = (inputRect.bottom) + 'px';
    dropdown.style.left = inputRect.left + 'px';
    dropdown.style.width = inputRect.width + 'px';
  } else {
    // マッチするポケモンがなければドロップダウンを閉じる
    dropdown.style.display = 'none';
  }
}


// ========================
// 5. 入力項目関連の関数
// ========================

// カスタムドロップダウン検索機能の実装
function implementCustomSearch() {
  // 既存の入力フィールドを取得
  const searchInput = document.getElementById('searchPokemon');
  const mySearchInput = document.getElementById('searchMyPokemon');
  
  // datalist属性を削除
  searchInput.removeAttribute('list');
  mySearchInput.removeAttribute('list');
  
  // ドロップダウンコンテナを作成
  const dropdownContainer = document.createElement('div');
  dropdownContainer.className = 'custom-dropdown';
  dropdownContainer.id = 'pokemonDropdown';
  dropdownContainer.style.display = 'none';
  searchInput.parentNode.appendChild(dropdownContainer);
  
  const myDropdownContainer = document.createElement('div');
  myDropdownContainer.className = 'custom-dropdown';
  myDropdownContainer.id = 'myPokemonDropdown';
  myDropdownContainer.style.display = 'none';
  mySearchInput.parentNode.appendChild(myDropdownContainer);
  
  // スタイルを追加（サイズと位置を調整）
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .custom-dropdown {
      position: absolute;
      max-height: 200px;
      overflow-y: auto;
      background-color: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      z-index: 1000;
      margin-top: 2px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      text-align: left;
    }
    .dropdown-item {
      padding: 5px 8px;
      cursor: pointer;
      border-bottom: 1px solid #eee;
      font-size: 14px;
      text-align: left;
    }
    .dropdown-item:hover {
      background-color: #f5f5f5;
    }
  `;
  document.head.appendChild(styleElement);
  
  // 入力イベントリスナーを設定
  searchInput.addEventListener('input', function() {
    filterDropdown(this.value, pokemonData, dropdownContainer, this);
  });
  
  mySearchInput.addEventListener('input', function() {
    filterDropdown(this.value, allPokemonData, myDropdownContainer, this);
  });

  // クリックイベントで何も入力がなければ全候補を表示
  searchInput.addEventListener('click', function() {
    if (!this.value || this.value.trim() === '') {
      showAllPokemonInDropdown(pokemonData, dropdownContainer, this);
    }
  });
  
  mySearchInput.addEventListener('click', function() {
    if (!this.value || this.value.trim() === '') {
      showAllPokemonInDropdown(allPokemonData, myDropdownContainer, this);
    }
  });
  
  // ドロップダウン外をクリックしたら閉じる
  document.addEventListener('click', function(event) {
    if (!dropdownContainer.contains(event.target) && event.target !== searchInput) {
      dropdownContainer.style.display = 'none';
    }
    
    if (!myDropdownContainer.contains(event.target) && event.target !== mySearchInput) {
      myDropdownContainer.style.display = 'none';
    }
  });
  
  // ESCキーでドロップダウンを閉じる
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      dropdownContainer.style.display = 'none';
      myDropdownContainer.style.display = 'none';
    }
  });
}

// ドロップダウンをフィルタリングして表示する関数
function filterDropdown(searchText, dataSource, dropdown, inputElement) {
  // 空文字列の場合は全ポケモンを表示
  if (!searchText || searchText.trim() === '') {
    showAllPokemonInDropdown(dataSource, dropdown, inputElement);
    return;
  }
  
  // 検索テキストを小文字化
  const lowerSearchText = searchText.toLowerCase();
  
  // カタカナとひらがなの変換
  const hiragana = lowerSearchText.replace(/[\u30A1-\u30F6]/g, function(match) {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
  
  const katakana = lowerSearchText.replace(/[\u3041-\u3096]/g, function(match) {
    return String.fromCharCode(match.charCodeAt(0) + 0x60);
  });
  
  // 検索条件に一致するポケモンを抽出（先頭一致）
  const filteredPokemon = [];
  
  for (let i = 0; i < dataSource.length; i++) {
    const pokemon = dataSource[i];
    if (!pokemon || !pokemon.name) continue;
    
    const nameLower = pokemon.name.toLowerCase();
    const hiraganaName = pokemon.hiragana ? pokemon.hiragana.toLowerCase() : '';
    const romajiName = pokemon.romaji ? pokemon.romaji.toLowerCase() : '';
    
    // 部分一致から先頭一致に変更
    if (nameLower.startsWith(lowerSearchText) || 
        nameLower.startsWith(hiragana) || 
        nameLower.startsWith(katakana) || 
        hiraganaName.startsWith(lowerSearchText) || 
        hiraganaName.startsWith(hiragana) || 
        hiraganaName.startsWith(katakana) || 
        romajiName.startsWith(lowerSearchText)) {
      filteredPokemon.push(pokemon);
      if (filteredPokemon.length >= 30) break;  // 最大30件まで
    }
  }
  
  // ドロップダウンをクリア
  dropdown.innerHTML = '';
  
  // 検索結果が0件の場合
  if (filteredPokemon.length === 0) {
    dropdown.style.display = 'none';
    return;
  }
  
  // 検索結果をドロップダウンに追加
  filteredPokemon.forEach(function(pokemon) {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    
    // カタカナ名のみ表示（ひらがな・ローマ字は表示しない）
    item.textContent = pokemon.name;
    
    // クリックイベント
    item.addEventListener('click', function() {
      // 入力欄に名前をセット
      inputElement.value = pokemon.name;
      dropdown.style.display = 'none';
      
      // 相手ポケモンか自分ポケモンかに応じて処理
      if (inputElement.id === 'searchPokemon') {
        selectPokemon();
      } else {
        selectMyPokemon();
      }
    });
    
    dropdown.appendChild(item);
  });
  
  // ドロップダウンを表示
  dropdown.style.display = 'block';
  
  // ドロップダウンの位置を調整
  dropdown.style.top = (inputElement.offsetTop + inputElement.offsetHeight) + 'px';
  dropdown.style.left = inputElement.offsetLeft + 'px';
  
  // テキストボックスと同じ幅に設定
  dropdown.style.width = inputElement.offsetWidth + 'px';
}

// HPをコピーする関数
function copyHP() {
  document.getElementById('maxHP').value = document.getElementById('currentHP').value;
}

// 検索キーワードでポケモンをフィルタリングする関数
function filterPokemon(keyword, dataSource) {
  if (!keyword || !dataSource) return [];
  
  // ひらがな・カタカナ変換
  const hiragana = keyword.replace(/[\u30A1-\u30F6]/g, function(match) {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
  
  const katakana = keyword.replace(/[\u3041-\u3096]/g, function(match) {
    return String.fromCharCode(match.charCodeAt(0) + 0x60);
  });
  
  // 検索条件に一致するポケモンを抽出
  return dataSource.filter(pokemon => {
    if (!pokemon) return false;
    
    const name = pokemon.name ? pokemon.name.toLowerCase() : '';
    const hiraganaName = pokemon.hiragana ? pokemon.hiragana.toLowerCase() : '';
    const romajiName = pokemon.romaji ? pokemon.romaji.toLowerCase() : '';
    
    return name.includes(keyword) || 
           name.includes(hiragana) || 
           name.includes(katakana) || 
           hiraganaName.includes(keyword) || 
           hiraganaName.includes(hiragana) || 
           hiraganaName.includes(katakana) || 
           romajiName.includes(keyword);
  });
}

// 全ポケモンをドロップダウンに表示する関数（入力なしの場合）
function showAllPokemonInDropdown(dataSource, dropdown, inputElement) {
  // ドロップダウンをクリア
  dropdown.innerHTML = '';
  
  // 一意のポケモン名のセットを作成（重複を排除）
  const uniqueNames = new Set();
  const uniquePokemon = [];
  
  // 重複を排除して全ポケモンを取得
  dataSource.forEach(pokemon => {
    if (pokemon && pokemon.name && !uniqueNames.has(pokemon.name)) {
      uniqueNames.add(pokemon.name);
      uniquePokemon.push(pokemon);
    }
  });
  
  // 検索結果をドロップダウンに追加
  uniquePokemon.forEach(function(pokemon) {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    
    // カタカナ名のみ表示
    item.textContent = pokemon.name;
    
    // クリックイベント
    item.addEventListener('click', function() {
      // 入力欄に名前をセット
      inputElement.value = pokemon.name;
      dropdown.style.display = 'none';
      
      // 相手ポケモンか自分ポケモンかに応じて処理
      if (inputElement.id === 'searchPokemon') {
        selectPokemon();
      } else {
        selectMyPokemon();
      }
    });
    
    dropdown.appendChild(item);
  });
  
  // ドロップダウンを表示
  dropdown.style.display = 'block';
  
  // ドロップダウンの位置を調整
  dropdown.style.top = (inputElement.offsetTop + inputElement.offsetHeight) + 'px';
  dropdown.style.left = inputElement.offsetLeft + 'px';
  
  // テキストボックスと同じ幅に設定
  dropdown.style.width = inputElement.offsetWidth + 'px';
}

// ドロップダウンをフィルタリングして表示する関数 (先頭一致版・一意表示)
function filterDropdown(searchText, dataSource, dropdown, inputElement) {
  // 空文字列の場合は全ポケモンを表示
  if (!searchText || searchText.trim() === '') {
    showAllPokemonInDropdown(dataSource, dropdown, inputElement);
    return;
  }
  
  // 検索テキストを小文字化
  const lowerSearchText = searchText.toLowerCase();
  
  // カタカナとひらがなの変換
  const hiragana = lowerSearchText.replace(/[\u30A1-\u30F6]/g, function(match) {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
  
  const katakana = lowerSearchText.replace(/[\u3041-\u3096]/g, function(match) {
    return String.fromCharCode(match.charCodeAt(0) + 0x60);
  });
  
  // 検索条件に一致するポケモンを抽出（先頭一致）
  const uniqueNames = new Set(); // 一意の名前を保持するセット
  const filteredPokemon = [];
  
  for (let i = 0; i < dataSource.length; i++) {
    const pokemon = dataSource[i];
    if (!pokemon || !pokemon.name) continue;
    
    // すでに同じ名前が追加されていたらスキップ
    if (uniqueNames.has(pokemon.name)) continue;
    
    const nameLower = pokemon.name.toLowerCase();
    const hiraganaName = pokemon.hiragana ? pokemon.hiragana.toLowerCase() : '';
    const romajiName = pokemon.romaji ? pokemon.romaji.toLowerCase() : '';
    
    // 先頭一致で検索
    if (nameLower.startsWith(lowerSearchText) || 
        nameLower.startsWith(hiragana) || 
        nameLower.startsWith(katakana) || 
        hiraganaName.startsWith(lowerSearchText) || 
        hiraganaName.startsWith(hiragana) || 
        hiraganaName.startsWith(katakana) || 
        romajiName.startsWith(lowerSearchText)) {
      
      // 名前をセットに追加して重複を防ぐ
      uniqueNames.add(pokemon.name);
      filteredPokemon.push(pokemon);
      
      if (filteredPokemon.length >= 30) break;  // 最大30件まで
    }
  }
  
  // ドロップダウンをクリア
  dropdown.innerHTML = '';
  
  // 検索結果が0件の場合
  if (filteredPokemon.length === 0) {
    dropdown.style.display = 'none';
    return;
  }
  
  // 検索結果をドロップダウンに追加
  filteredPokemon.forEach(function(pokemon) {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    
    // カタカナ名のみ表示
    item.textContent = pokemon.name;
    
    // クリックイベント
    item.addEventListener('click', function() {
      // 入力欄に名前をセット
      inputElement.value = pokemon.name;
      dropdown.style.display = 'none';
      
      // 相手ポケモンか自分ポケモンかに応じて処理
      if (inputElement.id === 'searchPokemon') {
        selectPokemon();
      } else {
        selectMyPokemon();
      }
    });
    
    dropdown.appendChild(item);
  });
  
  // ドロップダウンを表示
  dropdown.style.display = 'block';
  
  // ドロップダウンの位置を調整
  dropdown.style.top = (inputElement.offsetTop + inputElement.offsetHeight) + 'px';
  dropdown.style.left = inputElement.offsetLeft + 'px';
  
  // テキストボックスと同じ幅に設定
  dropdown.style.width = inputElement.offsetWidth + 'px';
}

// ドロップダウンを更新する関数
function updateDropdown(items, dropdown, inputElement) {
  // ドロップダウンをクリア
  dropdown.innerHTML = '';
  
  if (items.length === 0) {
    dropdown.style.display = 'none';
    return;
  }
  
  // 最大20件まで表示
  const displayItems = items.slice(0, 20);
  
  // ドロップダウンアイテムを作成
  displayItems.forEach(pokemon => {
    const item = document.createElement('div');
    item.style.padding = '5px 10px';
    item.style.cursor = 'pointer';
    item.style.borderBottom = '1px solid #eee';
    
    // ホバー効果
    item.addEventListener('mouseover', function() {
      this.style.backgroundColor = '#f0f0f0';
    });
    
    item.addEventListener('mouseout', function() {
      this.style.backgroundColor = 'white';
    });
    
    // 表示テキスト（カタカナ・ひらがな・ローマ字）
    let displayText = pokemon.name;
    if (pokemon.hiragana) {
      displayText += ` (${pokemon.hiragana})`;
    }
    if (pokemon.romaji) {
      displayText += ` [${pokemon.romaji}]`;
    }
    
    item.textContent = displayText;
    
    // クリックイベント
    item.addEventListener('click', function() {
      inputElement.value = pokemon.name;
      dropdown.style.display = 'none';
      
      // 相手ポケモンか自分ポケモンかに応じて処理
      if (inputElement.id === 'searchPokemon') {
        // 相手ポケモンの場合
        selectPokemon();
      } else {
        // 自分ポケモンの場合
        selectMyPokemon();
      }
    });
    
    dropdown.appendChild(item);
  });
  
  // ドロップダウンを表示
  dropdown.style.display = 'block';
  
  // 位置を調整
  const rect = inputElement.getBoundingClientRect();
  dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
  dropdown.style.left = (rect.left + window.scrollX) + 'px';
  dropdown.style.width = rect.width + 'px';
}

// ポケモン選択時の処理
function selectPokemon() {
  let inputText = document.getElementById('searchPokemon').value;
  let previousPokemonName = currentPokemonName;
  
  if (!inputText) {
    // ポケモン名が空の場合の処理（変更なし）
    document.querySelector('.moves-container').style.display = 'none';
    document.querySelector('.damage-estimate-container').style.display = 'none';
    document.getElementById('statusLabel').innerHTML = '';
    document.getElementById('baseStats').innerHTML = '';
    document.getElementById('originButtons').innerHTML = '';
    document.getElementById('estimateResult').innerHTML = '';
    
    // ポケモン名がクリアされたときにデータをリセット
    resetRangeData();
    
    currentPokemonName = "";
    currentPokemonMoves = [];
    currentOrigin = "";
    hasAddLevel = false;
    currentAddLevel = 0;
    
    return;
  }
  
  // 完全一致するポケモンを探す（カタカナ、ひらがな、ローマ字で検索）
  let exactMatchPokemon = null;
  
  // まずカタカナ名で検索
  exactMatchPokemon = pokemonData.find(p => p.name === inputText);
  
  // 見つからなければひらがな名で検索
  if (!exactMatchPokemon) {
    exactMatchPokemon = pokemonData.find(p => p.hiragana && p.hiragana === inputText);
  }
  
  // 見つからなければローマ字名で検索（大文字小文字区別なし）
  if (!exactMatchPokemon) {
    const lowerInputText = inputText.toLowerCase();
    exactMatchPokemon = pokemonData.find(p => p.romaji && p.romaji.toLowerCase() === lowerInputText);
  }
  
  if (exactMatchPokemon) {
    // ポケモン名が変わった場合、累積データをリセットして青いブロックを非表示にする
    if (previousPokemonName !== exactMatchPokemon.name) {
      resetRangeData();
      
      // 青いブロックを非表示にする追加処理
      const highlightedBlocks = document.querySelectorAll('.highlighted-result');
      highlightedBlocks.forEach(block => {
        block.innerHTML = '';
        block.style.display = 'none';
      });
      
    }
    
    // 完全一致する場合のみポケモンを選択
    let pokemonVariants = pokemonData.filter(p => p.name === exactMatchPokemon.name);
    
    if (pokemonVariants && pokemonVariants.length > 0) {
      currentPokemonName = exactMatchPokemon.name;
      
      if (pokemonVariants.length > 1) {
        showOriginButtons(pokemonVariants);
        selectPokemonVariant(pokemonVariants[0]);
      } else {
        document.getElementById('originButtons').innerHTML = '';
        selectPokemonVariant(pokemonVariants[0]);
      }
    }
  }
}

// 自分ポケモン選択時の処理
function selectMyPokemon() {
  
  // ポケモン名を取得（引数の有無に関わらず）
  let pokemonName = "";

    // どちらの入力欄からも取得を試みる
    const mainInput = document.getElementById('searchMyPokemon');
    const defInput = document.getElementById('searchDefPokemon');
    
    if (mainInput && mainInput.value) {
      pokemonName = mainInput.value;
    } else if (defInput && defInput.value) {
      pokemonName = defInput.value;
    }
  
  
  if (!pokemonName) {
    currentMyPokemonName = "";
    currentMyPokemonTypes = [];
    return;
  }
  
  // ポケモンデータを検索
  let exactMatchPokemon = allPokemonData.find(p => p.name === pokemonName);
  
  if (!exactMatchPokemon) {
    // ひらがな名で検索
    exactMatchPokemon = allPokemonData.find(p => p.hiragana && p.hiragana === pokemonName);
  }
  
  if (!exactMatchPokemon) {
    // ローマ字名で検索
    const lowerInputText = pokemonName.toLowerCase();
    exactMatchPokemon = allPokemonData.find(p => p.romaji && p.romaji.toLowerCase() === lowerInputText);
  }
  
  if (exactMatchPokemon) {
    currentMyPokemonName = exactMatchPokemon.name;
    
    // タイプ情報を設定
    if (exactMatchPokemon.type) {
      currentMyPokemonTypes = Array.isArray(exactMatchPokemon.type)
        ? exactMatchPokemon.type
        : [exactMatchPokemon.type];
    } else {
      currentMyPokemonTypes = [];
    }
    
    // 常に両方の入力欄を更新
    const mainInput = document.getElementById('searchMyPokemon');
    const defInput = document.getElementById('searchDefPokemon');
    
    if (mainInput) mainInput.value = exactMatchPokemon.name;
    if (defInput) defInput.value = exactMatchPokemon.name;
    
    //console.log("入力欄同期:", exactMatchPokemon.name);
  }
}

// 性格選択時の処理
function selectNature() {
  let selectedNature = document.getElementById('searchNature').value;
  // natureDataListから性格を検索
  let nature = natureDataList.find(n => n.name === selectedNature);
  
  // 性格補正の初期化（すべて等倍=1.0）
  natureModifiers = { a: 1.0, b: 1.0, c: 1.0, d: 1.0, s: 1.0 };
  
  if (nature) {
    // natureDataListの構造に合わせて各ステータスの補正値を直接設定
    natureModifiers.a = nature.a || 1.0;
    natureModifiers.b = nature.b || 1.0;
    natureModifiers.c = nature.c || 1.0;
    natureModifiers.d = nature.d || 1.0;
    natureModifiers.s = nature.s || 1.0;
  }
  
  updateStats();
}

// S実数値の変更を監視する関数
function setupSpeedValueMonitoring() {
  const speedValueInput = document.getElementById('speedValue');
  const badgeSpeedValueSpan = document.getElementById('badgeSpeedValue');
  const badgeBoostCheck = document.getElementById('badgeBoostCheck');
  
  if (!speedValueInput || !badgeSpeedValueSpan || !badgeBoostCheck) return;
  
  // 初期表示を更新
  updateBadgeSpeedDisplay();
  
  // 入力値変更時の処理
  speedValueInput.addEventListener('input', updateBadgeSpeedDisplay);
  speedValueInput.addEventListener('change', updateBadgeSpeedDisplay);
  
  // チェックボックス変更時の処理
  badgeBoostCheck.addEventListener('change', updateBadgeSpeedDisplay);
  
  // バッジ補正後のS実数値を計算して表示する関数
  function updateBadgeSpeedDisplay() {
    const speedValue = parseInt(speedValueInput.value) || 0;
    const badgeSpeedValue = Math.floor(speedValue * 110 / 100);
    badgeSpeedValueSpan.textContent = badgeSpeedValue;
  }
}

// 相手ポケモン入力欄のモニタリング設定を改良
function setupDefPokemonInputMonitoring() {
  // 監視対象を自分ポケモン入力欄(searchDefPokemon)に変更
  const defPokemonInput = document.getElementById('searchDefPokemon');
  if (!defPokemonInput) {
    console.error("searchDefPokemonの要素が見つかりません");
    return;
  }
  
  // 既存のイベントリスナーを削除（イベントの重複を避けるため）
  const newInput = defPokemonInput.cloneNode(true);
  defPokemonInput.parentNode.replaceChild(newInput, defPokemonInput);
  
  // 改めて参照を取得
  const refreshedInput = document.getElementById('searchDefPokemon');

  // クリック時に内容をクリア
  refreshedInput.addEventListener('click', function(e) {
    this.value = ''; 
  });

  // フォーカスが外れたときのイベント
  refreshedInput.addEventListener('blur', function(e) {
    updateDefPokemonSelection(e.target.value);
  });
  
  // Enterキーが押されたときのイベント
  refreshedInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault(); // フォーム送信を防止
      updateDefPokemonSelection(e.target.value);
      // ドロップダウンを非表示にする
      const dropdown = document.getElementById('defPokemonDropdown');
      if (dropdown) {
        dropdown.style.display = 'none';
      }
    }
    if (e.key === 'Tab') {
      // ドロップダウンを非表示にする
      const dropdown = document.getElementById('defPokemonDropdown');
      if (dropdown) {
        dropdown.style.display = 'none';
      }
    }
  });
  
  // 入力内容に基づいて自分ポケモン選択を処理する関数
  function updateDefPokemonSelection(pokemonName) {
    if (!pokemonName) {
      // 名前が空の場合は何もしない
      return;
    }
    
    // 完全一致するポケモンを検索
    let exactMatch = null;
    
    // まずカタカナ名で検索
    exactMatch = allPokemonData.find(p => p.name === pokemonName);
    
    // 見つからなければひらがな名で検索
    if (!exactMatch) {
      exactMatch = allPokemonData.find(p => p.hiragana && p.hiragana === pokemonName);
    }
    
    // 見つからなければローマ字名で検索
    if (!exactMatch) {
      const lowerName = pokemonName.toLowerCase();
      exactMatch = allPokemonData.find(p => p.romaji && p.romaji.toLowerCase() === lowerName);
    }
    
    // 部分一致で検索（完全一致がない場合のフォールバック）
    if (!exactMatch) {
      // ひらがな・カタカナ変換関数
      const toHiragana = (text) => {
        return text.replace(/[\u30A1-\u30F6]/g, function(match) {
          return String.fromCharCode(match.charCodeAt(0) - 0x60);
        });
      };
      
      const toKatakana = (text) => {
        return text.replace(/[\u3041-\u3096]/g, function(match) {
          return String.fromCharCode(match.charCodeAt(0) + 0x60);
        });
      };
      
      // 検索用のテキスト変換
      const searchText = pokemonName.toLowerCase();
      const hiraganaText = toHiragana(searchText);
      const katakanaText = toKatakana(searchText);
      
      // 先頭一致で検索
      const matchingPokemon = allPokemonData.filter(p => {
        if (!p || !p.name) return false;
        
        const name = p.name.toLowerCase();
        const hiraganaName = p.hiragana ? p.hiragana.toLowerCase() : '';
        const romajiName = p.romaji ? p.romaji.toLowerCase() : '';
        
        return name.startsWith(searchText) || 
               name.startsWith(hiraganaText) || 
               name.startsWith(katakanaText) || 
               hiraganaName.startsWith(searchText) || 
               hiraganaName.startsWith(hiraganaText) || 
               romajiName.startsWith(searchText);
      });
      
      // 最初のマッチを使用
      if (matchingPokemon.length > 0) {
        exactMatch = matchingPokemon[0];
      }
    }
    
    if (exactMatch) {
     
      // 入力値を正規化（カタカナ名に統一）
      refreshedInput.value = exactMatch.name;
      
      // グローバル変数を更新
      if (typeof currentMyPokemonName !== 'undefined') {
        currentMyPokemonName = exactMatch.name;
      }
      
      if (typeof currentMyPokemonTypes !== 'undefined') {
        if (exactMatch.type) {
          currentMyPokemonTypes = Array.isArray(exactMatch.type) ? exactMatch.type : [exactMatch.type];
        } else {
          currentMyPokemonTypes = [];
        }
      }
      
      // 与ダメ側の入力欄も同期
      const mainInput = document.getElementById('searchMyPokemon');
      if (mainInput) {
        mainInput.value = exactMatch.name;
      }
    } else {
      console.log('完全一致する自分ポケモンが見つかりませんでした:', pokemonName);
    }
  }

  // 初期値があれば処理
  if (refreshedInput.value) {
    updateDefPokemonSelection(refreshedInput.value);
  }
}

// ========================
// 6. UI表示関連関数
// ========================

// 全ポケモンリストを表示
function showAllPokemon() {
  document.getElementById('searchPokemon').value = '';
  document.getElementById('originButtons').innerHTML = '';
  document.getElementById('statusLabel').innerHTML = '';
  document.getElementById('baseStats').innerHTML = '';
  document.getElementById('movesSelect').innerHTML = '';
  document.getElementById('estimateResult').innerHTML = '';
  
  document.querySelector('.moves-container').style.display = 'none';
  document.querySelector('.damage-estimate-container').style.display = 'none';
  
  currentPokemonName = "";
  currentPokemonMoves = [];
  currentOrigin = "";
  hasAddLevel = false;
  currentAddLevel = 0;
  
  // ドロップダウンを閉じる
  const dropdown = document.getElementById('pokemonDropdown');
  if (dropdown) {
    dropdown.style.display = 'none';
  }
}

// 自分ポケモンのテキストボックスをクリア
function showAllMyPokemon() {
  document.getElementById('searchMyPokemon').value = '';
  currentMyPokemonName = "";
  currentMyPokemonTypes = [];
  
  // ドロップダウンを閉じる
  const dropdown = document.getElementById('myPokemonDropdown');
  if (dropdown) {
    dropdown.style.display = 'none';
  }
}

// 性格のテキストボックスをクリア
function showAllNatures() {
  document.getElementById('searchNature').value = '';
  populateNatureList();
}

// オリジンボタンを表示する関数
function showOriginButtons(variants) {
  const originButtonsContainer = document.getElementById('originButtons');
  originButtonsContainer.innerHTML = '';
  
  const origins = [...new Set(variants.map(v => v.origin))];
  
  origins.forEach(origin => {
    const button = document.createElement('button');
    button.textContent = origin;
    button.className = 'origin-btn';
    button.onclick = function() {
      const pokemonVariant = variants.find(v => v.origin === origin);
      if (pokemonVariant) {
        document.querySelectorAll('.origin-btn').forEach(btn => {
          btn.classList.remove('selected');
        });
        button.classList.add('selected');
        selectPokemonVariant(pokemonVariant);
      }
    };
    originButtonsContainer.appendChild(button);
  });
  
  if (origins.length > 0) {
    originButtonsContainer.querySelector('.origin-btn').classList.add('selected');
  }
}

// 相手ポケモン選択後に実行する処理
function selectPokemonVariant(pokemon) {
  currentOrigin = pokemon.origin || '';
  
  let allPokemonInfo = allPokemonData.find(p => p.name === pokemon.name);
  
  if (allPokemonInfo && allPokemonInfo.basestats) {
    baseStats = {
      hp: allPokemonInfo.basestats[0],
      a: allPokemonInfo.basestats[1],
      b: allPokemonInfo.basestats[2],
      c: allPokemonInfo.basestats[3],
      d: allPokemonInfo.basestats[4],
      s: allPokemonInfo.basestats[5]
    };
  } else {
    baseStats = { hp: 0, a: 0, b: 0, c: 0, d: 0, s: 0 };
  }
  
  if (pokemon.add_level !== undefined && pokemon.add_level !== null) {
    currentAddLevel = pokemon.add_level;
    hasAddLevel = true;
  } else {
    currentAddLevel = 0;
    hasAddLevel = false;
  }
  
  // アイテム情報の取得
  currentItem = null; // 一旦リセット
  if (pokemon.item) {
    // アイテム名からアイテムデータを検索
    currentItem = itemData.find(item => item.name === pokemon.item);
  }
  
  currentPokemonMoves = pokemon.moves || [];
  
  if (pokemon.level !== undefined) {
    document.getElementById('defLevel').value = pokemon.level;
  } else {
    document.getElementById('defLevel').value = 50;
  }
  
  // ステータスラベルにアイテム情報は表示しない
  document.getElementById('statusLabel').innerHTML = "[ステータス]";
  
  // アイテム表示関連のクリーンアップ
  const existingItemEffect = document.getElementById('itemEffectInfo');
  if (existingItemEffect) {
    existingItemEffect.parentNode.removeChild(existingItemEffect);
  }
  
  // チェックボックスの表示・非表示を切り替え
  const darkPokemonContainer = document.getElementById('darkPokemonContainer');
  const badgeBoostContainer = document.getElementById('badgeBoostContainer');
  const spdBadgeBoostContainer = document.querySelector('.spdBadgeBoostContainer');
  const defBadgeBoostContainer = document.getElementById('defBadgeBoostContainer');
  const darknessContainer = document.getElementById('darknessContainer');
  const yogaPowerContainer = document.getElementById('yogaPowerContainer');
  const harikiriContainer = document.getElementById('harikiriContainer');
  const shinryokuContainer = document.getElementById('shinryokuContainer');
  const moukaContainer = document.getElementById('moukaContainer');
  const gekiryuContainer = document.getElementById('gekiryuContainer');
  const mushiNoShiraseContainer = document.getElementById('mushiNoShiraseContainer');

  if (darkPokemonContainer) {
    // XDの場合のみダークポケモンチェックボックスを表示
    darkPokemonContainer.style.display = currentOrigin === 'XD' ? 'block' : 'none';
    darknessContainer.style.display = currentOrigin === 'XD' ? 'block' : 'none';
    // チェックボックスをリセット
    document.getElementById('darkPokemonCheck').checked = false;
    document.getElementById('darknessCheck').checked = false;
  }
  // ヨガパワーチェックボックスの表示制御
  if (yogaPowerContainer) {
    const hasYogaPower = pokemon.ability && pokemon.ability === 'ヨガパワー';
    yogaPowerContainer.style.display = hasYogaPower ? 'block' : 'none';
    // チェックボックスの状態を設定（表示時はチェック、非表示時はチェック解除）
    const yogaPowerCheck = document.getElementById('yogaPowerCheck');
    if (yogaPowerCheck) {
      yogaPowerCheck.checked = hasYogaPower;
    }
  }
  // はりきりチェックボックスの表示制御
  if (harikiriContainer) {
    const hasHarikiri = pokemon.ability && pokemon.ability === 'はりきり';
    harikiriContainer.style.display = hasHarikiri ? 'block' : 'none';    
    // チェックボックスの状態を設定（はりきりじゃない場合もあるので外しておく）
    const harikiriCheck = document.getElementById('harikiriCheck');
    harikiriCheck.checked = false;
  }
  // しんりょくチェックボックスの表示制御
  if (shinryokuContainer) {
    const hasShinryoku = pokemon.ability && pokemon.ability === 'しんりょく';
    shinryokuContainer.style.display = hasShinryoku ? 'block' : 'none';   
    // チェックボックスの状態を設定（発動していない場合の方が多いので外しておく）
    const shinryokuCheck = document.getElementById('shinryokuCheck');
    shinryokuCheck.checked = false;
  }
  // もうかチェックボックスの表示制御
  if (moukaContainer) {
    const hasMouka = pokemon.ability && pokemon.ability === 'もうか';
    moukaContainer.style.display = hasMouka ? 'block' : 'none';   
    // チェックボックスの状態を設定（発動していない場合の方が多いので外しておく）
    const moukaCheck = document.getElementById('moukaCheck');
    moukaCheck.checked = false;
  }
  // げきりゅうチェックボックスの表示制御
  if (gekiryuuContainer) {
    const hasGekiryuu = pokemon.ability && pokemon.ability === 'げきりゅう';
    gekiryuuContainer.style.display = hasGekiryuu ? 'block' : 'none';   
    // チェックボックスの状態を設定（発動していない場合の方が多いので外しておく）
    const gekiryuuCheck = document.getElementById('gekiryuuCheck');
    gekiryuuCheck.checked = false;
  }
  // むしのしらせチェックボックスの表示制御
  if (mushiNoShiraseContainer) {
    const hasMushiNoShirase = pokemon.ability && pokemon.ability === 'むしのしらせ';
    mushiNoShiraseContainer.style.display = hasMushiNoShirase ? 'block' : 'none';
    // チェックボックスの状態を設定（発動していない場合の方が多いので外しておく）
    const mushiNoShiraseCheck = document.getElementById('mushiNoShiraseCheck');
    mushiNoShiraseCheck.checked = false;
  }

  // オリジンボタンをクリックしたときの処理に追加
  if (defBadgeBoostContainer) {
    // オリジンに応じて表示状態とチェック状態を設定
    const shouldDisplay = (currentOrigin !== 'Co' && currentOrigin !== 'XD');
    
    // 表示状態を設定
    badgeBoostContainer.style.display = shouldDisplay ? 'block' : 'none';
    defBadgeBoostContainer.style.display = shouldDisplay ? 'block' : 'none';

    if (spdBadgeBoostContainer) {
      spdBadgeBoostContainer.style.display = shouldDisplay ? 'flex' : 'none';
    }
    
    // チェック状態を表示状態に合わせる
    const badgeBoostCheck = document.getElementById('badgeBoostCheck');
    const defBadgeBoostCheck = document.getElementById('defBadgeBoostCheck');
    
    if (badgeBoostCheck) {
      badgeBoostCheck.checked = shouldDisplay;
    }
    
    if (defBadgeBoostCheck) {
      defBadgeBoostCheck.checked = shouldDisplay;
    }
  }

  document.querySelector('.damage-form').style.display = 'block';

  updateStats();
  showMoves();
}

// ステータス計算・表示関数
function updateStats() {
  if (!baseStats.hp) return;
  
  const level = parseInt(document.getElementById('defLevel').value) || 50;
  
  const effortValue = 0;
  
  const hpBase = baseStats.hp * 2 + ivValues.hp + Math.floor(effortValue / 4);
  const hpLevel = Math.floor(hpBase * level / 100);
  const hpStat = hpLevel + level + 10;
  
  const aBase = baseStats.a * 2 + ivValues.a + Math.floor(effortValue / 4);
  const aLevel = Math.floor(aBase * level / 100);
  const aWithoutNature = aLevel + 5;
  const aStat = Math.floor(aWithoutNature * natureModifiers.a);
  
  const bBase = baseStats.b * 2 + ivValues.b + Math.floor(effortValue / 4);
  const bLevel = Math.floor(bBase * level / 100);
  const bWithoutNature = bLevel + 5;
  const bStat = Math.floor(bWithoutNature * natureModifiers.b);
  
  const cBase = baseStats.c * 2 + ivValues.c + Math.floor(effortValue / 4);
  const cLevel = Math.floor(cBase * level / 100);
  const cWithoutNature = cLevel + 5;
  const cStat = Math.floor(cWithoutNature * natureModifiers.c);
  
  const dBase = baseStats.d * 2 + ivValues.d + Math.floor(effortValue / 4);
  const dLevel = Math.floor(dBase * level / 100);
  const dWithoutNature = dLevel + 5;
  const dStat = Math.floor(dWithoutNature * natureModifiers.d);
  
  const sBase = baseStats.s * 2 + ivValues.s + Math.floor(effortValue / 4);
  const sLevel = Math.floor(sBase * level / 100);
  const sWithoutNature = sLevel + 5;
  const sStat = Math.floor(sWithoutNature * natureModifiers.s);
  
  // ステータスを表示（性格補正を反映）
  let statsText = '';
  
  // HPは性格補正の影響を受けないのでそのまま表示
  statsText += `${hpStat}-`;
  
  // A（攻撃）に性格補正があれば表示
  if (natureModifiers.a !== 1.0) {
    if (natureModifiers.a > 1.0) {
      statsText += `<span style="color:red">${aStat}</span>-`;
    } else {
      statsText += `<span style="color:blue">${aStat}</span>-`;
    }
  } else {
    statsText += `${aStat}-`;
  }
  
  // B（防御）に性格補正があれば表示
  if (natureModifiers.b !== 1.0) {
    if (natureModifiers.b > 1.0) {
      statsText += `<span style="color:red">${bStat}</span>-`;
    } else {
      statsText += `<span style="color:blue">${bStat}</span>-`;
    }
  } else {
    statsText += `${bStat}-`;
  }
  
  // C（特攻）に性格補正があれば表示
  if (natureModifiers.c !== 1.0) {
    if (natureModifiers.c > 1.0) {
      statsText += `<span style="color:red">${cStat}</span>-`;
    } else {
      statsText += `<span style="color:blue">${cStat}</span>-`;
    }
  } else {
    statsText += `${cStat}-`;
  }
  
  // D（特防）に性格補正があれば表示
  if (natureModifiers.d !== 1.0) {
    if (natureModifiers.d > 1.0) {
      statsText += `<span style="color:red">${dStat}</span>-`;
    } else {
      statsText += `<span style="color:blue">${dStat}</span>-`;
    }
  } else {
    statsText += `${dStat}-`;
  }
  
  // S（素早さ）に性格補正があれば表示
  if (natureModifiers.s !== 1.0) {
    if (natureModifiers.s > 1.0) {
      statsText += `<span style="color:red">${sStat}</span>`;
    } else {
      statsText += `<span style="color:blue">${sStat}</span>`;
    }
  } else {
    statsText += `${sStat}`;
  }
  
  // レベル補正情報をより明確に分離
  if (hasAddLevel) {
    statsText += `<div style="margin-top: 3px; margin-bottom: 3px;">`;
    statsText += `[レベル補正:+${currentAddLevel}]`;
    
    // レベル補正が0より大きい場合のみ補正後の値を表示
    if (currentAddLevel > 0) {
      const correctedLevel = level + currentAddLevel;
      
      const correctedHpBase = baseStats.hp * 2 + ivValues.hp + Math.floor(effortValue / 4);
      const correctedHpLevel = Math.floor(correctedHpBase * correctedLevel / 100);
      const correctedHpStat = correctedHpLevel + correctedLevel + 10;
      
      const correctedABase = baseStats.a * 2 + ivValues.a + Math.floor(effortValue / 4);
      const correctedALevel = Math.floor(correctedABase * correctedLevel / 100);
      const correctedAWithoutNature = correctedALevel + 5;
      const correctedAStat = Math.floor(correctedAWithoutNature * natureModifiers.a);
      
      const correctedBBase = baseStats.b * 2 + ivValues.b + Math.floor(effortValue / 4);
      const correctedBLevel = Math.floor(correctedBBase * correctedLevel / 100);
      const correctedBWithoutNature = correctedBLevel + 5;
      const correctedBStat = Math.floor(correctedBWithoutNature * natureModifiers.b);
      
      const correctedCBase = baseStats.c * 2 + ivValues.c + Math.floor(effortValue / 4);
      const correctedCLevel = Math.floor(correctedCBase * correctedLevel / 100);
      const correctedCWithoutNature = correctedCLevel + 5;
      const correctedCStat = Math.floor(correctedCWithoutNature * natureModifiers.c);
      
      const correctedDBase = baseStats.d * 2 + ivValues.d + Math.floor(effortValue / 4);
      const correctedDLevel = Math.floor(correctedDBase * correctedLevel / 100);
      const correctedDWithoutNature = correctedDLevel + 5;
      const correctedDStat = Math.floor(correctedDWithoutNature * natureModifiers.d);
      
      const correctedSBase = baseStats.s * 2 + ivValues.s + Math.floor(effortValue / 4);
      const correctedSLevel = Math.floor(correctedSBase * correctedLevel / 100);
      const correctedSWithoutNature = correctedSLevel + 5;
      const correctedSStat = Math.floor(correctedSWithoutNature * natureModifiers.s);
      
      statsText += `<br>`;
      
      // HPは性格補正の影響を受けないのでそのまま表示
      statsText += `${correctedHpStat}-`;
      
      // A（攻撃）に性格補正があれば表示
      if (natureModifiers.a !== 1.0) {
        if (natureModifiers.a > 1.0) {
          statsText += `<span style="color:red">${correctedAStat}</span>-`;
        } else {
          statsText += `<span style="color:blue">${correctedAStat}</span>-`;
        }
      } else {
        statsText += `${correctedAStat}-`;
      }
      
      // B（防御）に性格補正があれば表示
      if (natureModifiers.b !== 1.0) {
        if (natureModifiers.b > 1.0) {
          statsText += `<span style="color:red">${correctedBStat}</span>-`;
        } else {
          statsText += `<span style="color:blue">${correctedBStat}</span>-`;
        }
      } else {
        statsText += `${correctedBStat}-`;
      }
      
      // C（特攻）に性格補正があれば表示
      if (natureModifiers.c !== 1.0) {
        if (natureModifiers.c > 1.0) {
          statsText += `<span style="color:red">${correctedCStat}</span>-`;
        } else {
          statsText += `<span style="color:blue">${correctedCStat}</span>-`;
        }
      } else {
        statsText += `${correctedCStat}-`;
      }
      
      // D（特防）に性格補正があれば表示
      if (natureModifiers.d !== 1.0) {
        if (natureModifiers.d > 1.0) {
          statsText += `<span style="color:red">${correctedDStat}</span>-`;
        } else {
          statsText += `<span style="color:blue">${correctedDStat}</span>-`;
        }
      } else {
        statsText += `${correctedDStat}-`;
      }
      
      // S（素早さ）に性格補正があれば表示
      if (natureModifiers.s !== 1.0) {
        if (natureModifiers.s > 1.0) {
          statsText += `<span style="color:red">${correctedSStat}</span>`;
        } else {
          statsText += `<span style="color:blue">${correctedSStat}</span>`;
        }
      } else {
        statsText += `${correctedSStat}`;
      }
    }
    statsText += `</div>`;
  }
  
  // アイテム情報があれば表示
  if (currentItem) {
    statsText += `<div style="margin-top: 2px;">持ち物: ${currentItem.name}</div>`;
  }
  
  document.getElementById('baseStats').innerHTML = statsText;
}

// レベル変更時の処理
function updateLevel() {
  updateStats();
}

// 個体値ボタンの選択処理
function selectIv(stat, value, button) {
  const parent = button.closest('.iv-row');
  const buttons = parent.querySelectorAll('.iv-btn');
  buttons.forEach(btn => btn.classList.remove('selected'));
  
  button.classList.add('selected');
  
  const customInput = document.getElementById(`customIv${stat.toUpperCase()}`);
  const otherButtonContainer = parent.querySelector('.iv-btn-container');
  const otherButton = otherButtonContainer.querySelector('.iv-btn.other');
  customInput.style.display = 'none';
  otherButton.style.display = 'inline-block';
  
  ivValues[stat] = value;
  
  updateStats();
}

// 「その他」ボタンクリック時
function showCustomIv(stat, button) {
  const parent = button.closest('.iv-row');
  const buttons = parent.querySelectorAll('.iv-btn');
  buttons.forEach(btn => btn.classList.remove('selected'));
  
  // その他ボタンを選択状態にする
  button.classList.add('selected');
  
  // ボタンを視覚的にのみ非表示にする (位置は保持)
  button.style.visibility = 'hidden';
  
  // カスタム入力欄を取得して表示
  const customInput = document.getElementById(`customIv${stat.toUpperCase()}`);
  
  // 入力欄のスタイルを設定して表示
  customInput.style.width = '50px';
  customInput.style.height = '24px';
  customInput.style.padding = '0 2px';
  customInput.style.fontSize = '12px';
  customInput.style.border = '1px solid #ccc';
  customInput.style.backgroundColor = 'white';
  customInput.style.position = 'absolute';
  customInput.style.top = '0';
  customInput.style.left = '0';
  customInput.style.zIndex = '10';
  customInput.style.display = 'block';
  
  // 現在の個体値を表示
  customInput.value = ivValues[stat];
  customInput.focus();
  
  // 入力欄をクリックしてもフォーカスが外れないように
  customInput.addEventListener('click', function(e) {
    e.stopPropagation();
  });
}

// カスタム個体値が入力されたときの処理
function applyCustomIv(stat, input) {
  const value = parseInt(input.value) || 0;
  const validValue = Math.min(Math.max(value, 0), 31); // 0-31の範囲に制限
  input.value = validValue; // 値を正規化して表示
  
  const parent = input.closest('.iv-row');
  let buttonFound = false;
  
  // 入力値が0, 30, 31のいずれかの場合
  if (validValue === 0 || validValue === 30 || validValue === 31) {
    const buttons = parent.querySelectorAll('.iv-btn');
    buttons.forEach(btn => {
      if (btn.dataset.value == validValue && btn.dataset.stat == stat) {
        // 該当するボタンを選択状態に
        buttons.forEach(b => {
          if (b.dataset.stat == stat) {
            b.classList.remove('selected');
          }
        });
        btn.classList.add('selected');
        buttonFound = true;
        
        // その他ボタンを再表示
        const otherButton = parent.querySelector(`.iv-btn.other[data-stat="${stat}"]`);
        if (otherButton) {
          otherButton.style.visibility = 'visible';
          otherButton.classList.remove('selected');
          input.style.display = 'none';
        }
      }
    });
  }
  
  // 入力値が0, 30, 31以外の場合 または 対応するボタンが見つからない場合
  if (!buttonFound) {
    // すべてのボタンの選択状態を解除
    const buttons = parent.querySelectorAll(`.iv-btn[data-stat="${stat}"]`);
    buttons.forEach(btn => btn.classList.remove('selected'));
    
    // その他ボタンを選択状態にして非表示のまま
    const otherButton = parent.querySelector(`.iv-btn.other[data-stat="${stat}"]`);
    if (otherButton) {
      otherButton.classList.add('selected');
      otherButton.style.visibility = 'hidden';
      input.style.display = 'block'; // テキストボックスは表示したまま
    }
  }
  
  // 値を更新
  ivValues[stat] = validValue;
  updateStats();
}

// 個体値ボタンをクリックしたときの処理
function selectIv(stat, value, button) {
  const parent = button.closest('.iv-row');
  const buttons = parent.querySelectorAll('.iv-btn');
  
  // すべてのボタンの選択状態を解除
  buttons.forEach(btn => btn.classList.remove('selected'));
  
  // クリックしたボタンを選択状態に
  button.classList.add('selected');
  
  // その他ボタンを表示状態に
  const otherButton = parent.querySelector(`.iv-btn.other[data-stat="${stat}"]`);
  if (otherButton) {
    otherButton.style.visibility = 'visible';
  }
  
  // カスタム入力欄を非表示に
  const customInput = document.getElementById(`customIv${stat.toUpperCase()}`);
  if (customInput) {
    customInput.style.display = 'none';
  }
  
  // 個体値を更新
  ivValues[stat] = value;
  updateStats();
}

// 性格チェックボックス連動機能

// チェックボックスの状態変更時の処理
function handleNatureCheckboxChange(checkbox, type) {
  const stat = checkbox.dataset.stat;
  const isChecked = checkbox.checked;
  
  //console.log(`${type} checkbox for ${stat} is now ${isChecked ? 'checked' : 'unchecked'}`);
  
  if (isChecked) {
    // 同じタイプ（プラスorマイナス）の他のチェックボックスをオフにする
    document.querySelectorAll(`.nature-${type}-checkbox`).forEach(cb => {
      if (cb !== checkbox && cb.checked) {
        cb.checked = false;
      }
    });
  }
  
  // 性格の組み合わせを確認して適用
  applyNatureFromCheckboxes();
}

// チェックボックスの状態から性格を適用する関数
function applyNatureFromCheckboxes() {
  // プラス側とマイナス側のチェックされた能力値を取得
  let plusStat = null;
  let minusStat = null;
  
  // プラスのチェックボックスを確認
  document.querySelectorAll('.nature-plus-checkbox:checked').forEach(cb => {
    plusStat = cb.dataset.stat;
  });
  
  // マイナスのチェックボックスを確認
  document.querySelectorAll('.nature-minus-checkbox:checked').forEach(cb => {
    minusStat = cb.dataset.stat;
  });
  
  // プラスとマイナスの両方が選択されている場合のみ性格を適用
  if (plusStat && minusStat) {
    // 対応する性格を検索
    const nature = findNatureByStats(plusStat, minusStat);
    
    if (nature) {
      //console.log(`該当する性格が見つかりました: ${nature.name}`);
      
      // 性格名をテキストボックスに設定
      const natureInput = document.getElementById('searchNature');
      if (natureInput) {
        natureInput.value = nature.name;
        
        // 性格変更イベントを発火させて反映
        natureInput.dispatchEvent(new Event('change'));
        natureInput.dispatchEvent(new Event('input'));
      }
    } else {
      //console.log('該当する性格が見つかりませんでした');
    }
  }
  // プラスもマイナスもチェックされていない場合は「まじめ」に設定
  if (!plusStat && !minusStat) {
    const natureInput = document.getElementById('searchNature');
    if (natureInput) {
      natureInput.value = "まじめ";
      // 性格変更イベントを発火させて反映
      natureInput.dispatchEvent(new Event('change'));
      natureInput.dispatchEvent(new Event('input'));
    }
    return;
  }
}

// 能力値の組み合わせから性格を検索する関数
function findNatureByStats(plusStat, minusStat) {
  // 同じ能力値の場合は該当する性格がない
  if (plusStat === minusStat) {
    return null;
  }
  
  // natureDataから該当する性格を検索
  return natureData.find(nature => {
    // 性格補正値チェック
    const hasPlus = nature[plusStat] === 1.1;
    const hasMinus = nature[minusStat] === 0.9;
    
    return hasPlus && hasMinus;
  });
}

// 性格設定時にチェックボックスも連動する関数
function updateNatureCheckboxes(natureName) {
  // すべてのチェックボックスをクリア
  document.querySelectorAll('.nature-plus-checkbox, .nature-minus-checkbox').forEach(cb => {
    cb.checked = false;
  });
  
  // 性格が無補正なら何もしない
  if (!natureName || natureName === "まじめ" || natureName === "がんばりや" || 
      natureName === "すなお" || natureName === "きまぐれ" || natureName === "てれや") {
    return;
  }
  
  // 性格を検索
  const nature = natureData.find(n => n.name === natureName);
  if (!nature) return;
  
  // 各能力値をチェックして補正がかかっているものを特定
  const stats = ['a', 'b', 'c', 'd', 's'];
  
  stats.forEach(stat => {
    if (nature[stat] === 1.1) {
      // プラス補正
      const plusCheckbox = document.querySelector(`.nature-plus-checkbox[data-stat="${stat}"]`);
      if (plusCheckbox) plusCheckbox.checked = true;
    } else if (nature[stat] === 0.9) {
      // マイナス補正
      const minusCheckbox = document.querySelector(`.nature-minus-checkbox[data-stat="${stat}"]`);
      if (minusCheckbox) minusCheckbox.checked = true;
    }
  });
}

// 既存のselectNature関数を拡張
const originalSelectNature = window.selectNature || function() {};
window.selectNature = function() {
  // 元の関数を呼び出し
  originalSelectNature.apply(this, arguments);
  
  // 追加の処理：チェックボックスを更新
  let selectedNature = document.getElementById('searchNature').value;
  updateNatureCheckboxes(selectedNature);
};

// 初期化：チェックボックスにイベントリスナーを設定
function initializeNatureCheckboxes() {
  // プラスチェックボックスのイベントリスナー
  document.querySelectorAll('.nature-plus-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      handleNatureCheckboxChange(this, 'plus');
    });
  });
  
  // マイナスチェックボックスのイベントリスナー
  document.querySelectorAll('.nature-minus-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      handleNatureCheckboxChange(this, 'minus');
    });
  });
  
  // 性格が選択されている場合は初期状態のチェックボックスを設定
  const natureInput = document.getElementById('searchNature');
  if (natureInput && natureInput.value) {
    updateNatureCheckboxes(natureInput.value);
  }
}

// ========================
// 7. わざリスト表示関数
// ========================

function showMoves() {
  const movesList = document.getElementById('movesSelect');
  if (!movesList) return;
  
  movesList.innerHTML = '';
  
  // ポケモン名が空の場合はわざリストを表示しない
  if (!currentPokemonName) {
    document.querySelector('.moves-container').style.display = 'none';
    document.querySelector('.damage-estimate-container').style.display = 'none';
    return;
  }
  
  // 技がない場合はわざリストと推定ボタンを表示しない
  if (!currentPokemonMoves || currentPokemonMoves.length === 0) {
    document.querySelector('.moves-container').style.display = 'none';
    document.querySelector('.damage-estimate-container').style.display = 'none';
    return;
  }
  
  // 技がある場合はわざリストと推定ボタンを表示
  document.querySelector('.moves-container').style.display = 'block';
  document.querySelector('.damage-estimate-container').style.display = 'block';
  
  // チェックボックスを初期化
  initializeTrackingCheckbox();
  
  // 技の数に応じてselect要素のサイズを調整
  movesList.size = currentPokemonMoves.length;
  movesList.style.height = (currentPokemonMoves.length * 24) + 'px'; // 1つの技につき24pxを割り当て
  
  currentPokemonMoves.forEach(move => {
    const option = document.createElement('option');
    
    // 技名の表示（originは表示せず、ダークラッシュはそのまま表示）
    option.textContent = move;
    option.dataset.originalName = move; // 元の技名を保存
    
    movesList.appendChild(option);
  });
  
  if (movesList.options.length > 0) {
    movesList.selectedIndex = 0; // 最初の技を選択
        // 重要: 最初の技が選択された状態で、ダブル半減チェックボックスの表示状態を更新
        updateDefDoubleCheckDisplay(movesList.options[0].textContent);
  }
  // 技リストに変更イベントリスナーを追加
  movesList.addEventListener('change', function() {
    // 選択された技の名前を取得
    const selectedMove = this.options[this.selectedIndex].textContent;
    
    // 技情報を検索
    const moveInfo = moveData.find(m => m.name === selectedMove);

    // 被ダメ計算側のダブル半減チェックボックス処理
    const defDoubleCheckContainer = document.getElementById('defDoubleCheckContainer');
    const defDoubleCheck = document.getElementById('defDoubleCheck');
    
    if (defDoubleCheckContainer && defDoubleCheck) {
      if (moveInfo && moveInfo.target == 2) {
        // 全体技の場合は表示してチェックを入れる
        defDoubleCheckContainer.style.display = 'block';
        defDoubleCheck.checked = true;
      } else {
        // それ以外の場合は非表示にしてチェックを外す
        defDoubleCheckContainer.style.display = 'none';
        defDoubleCheck.checked = false;
      }
    }

    // きしかいせい・じたばた用の表示
    if (moveInfo && moveInfo.class === "pinch_up") {
      document.querySelector('.pinchUp2Container').style.display = 'flex';
      } else {
      document.querySelector('.pinchUp2Container').style.display = 'none';
    }
    // トリプルキック用の表示
    if (moveInfo && moveInfo.class === "triple_kick") {
      document.querySelector('.tripleKickContainer').style.display = 'flex';
    } else {
      document.querySelector('.tripleKickContainer').style.display = 'none';
    }
  });
}
// 被ダメ計算セクションのダブル半減チェックボックスの表示状態を更新する関数
function updateDefDoubleCheckDisplay(moveName) {
  // 技情報を検索
  const moveInfo = findMoveInfo(moveName);
  
  // 被ダメ計算側のダブル半減チェックボックス処理
  const defDoubleCheckContainer = document.getElementById('defDoubleCheckContainer');
  const defDoubleCheck = document.getElementById('defDoubleCheck');
  
  if (defDoubleCheckContainer && defDoubleCheck) {
    if (moveInfo && moveInfo.target == 2) {
      // 全体技の場合は表示してチェックを入れる
      defDoubleCheckContainer.style.display = 'block';
      defDoubleCheck.checked = true;
    } else {
      // それ以外の場合は非表示にしてチェックを外す
      defDoubleCheckContainer.style.display = 'none';
      defDoubleCheck.checked = false;
    }
  }
}
// ========================
// 8. 絞り込み機能関連
// ========================

// チェックボックスを表示する初期化関数
function initializeTrackingCheckbox() {
  // すでに存在する場合は何もしない
  if (document.getElementById('trackingCheckbox')) {
    return;
  }
  
  // 表示位置を特定 - estimateResultの近く
  const estimateResult = document.getElementById('estimateResult');
  if (!estimateResult) return;
  
  // チェックボックス用のコンテナを作成
  const checkboxContainer = document.createElement('div');
  checkboxContainer.className = 'tracking-checkbox-container';
  checkboxContainer.style.margin = '10px 0';
  
  // チェックボックスを作成
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'trackingCheckbox';
  checkbox.checked = isTrackingEnabled;
  
  // ラベルを作成
  const label = document.createElement('label');
  label.htmlFor = 'trackingCheckbox';
  label.textContent = '連続する結果を保持(個体絞り込み)';
  label.style.marginLeft = '5px';
  
  // イベントリスナーを追加
  checkbox.addEventListener('change', function() {
    isTrackingEnabled = this.checked;
    
    // チェックが外れた場合、累積データをリセット
    if (!isTrackingEnabled) {
      resetRangeData();
    }
  });
  
  // 要素を追加
  checkboxContainer.appendChild(checkbox);
  checkboxContainer.appendChild(label);
  
  // estimateResultの前に挿入
  if (estimateResult.parentNode) {
    estimateResult.parentNode.insertBefore(checkboxContainer, estimateResult);
  }
}

// 累積データをリセットする関数
function resetRangeData() {
  // 物理と特殊の両方のデータをリセット
  physicalRangeMin = 0;
  physicalRangeMax = 999;
  specialRangeMin = 0;
  specialRangeMax = 999;
  
  // 互換性のための変数も更新
  cumulativeMinAtk = 0;
  cumulativeMaxAtk = 999;
  
  // 強調表示ブロックをすべて取得
  const highlightedResults = document.querySelectorAll('.highlighted-result');
  
  // 各ブロックの内容をクリアして非表示にする
  highlightedResults.forEach(block => {
    block.innerHTML = ''; // 内容をクリア
    block.style.display = 'none'; // 非表示にする
  });
}

// チェックボックスを表示する初期化関数
function initializeTrackingCheckbox() {
  // すでに存在する場合は何もしない
  const existingCheckbox = document.getElementById('trackingCheckbox');
  if (existingCheckbox) {
    // 既存のチェックボックスのイベントリスナーをクリアして再設定
    const newCheckbox = existingCheckbox.cloneNode(true);
    existingCheckbox.parentNode.replaceChild(newCheckbox, existingCheckbox);
    
    // 新しいイベントリスナーを設定
    newCheckbox.addEventListener('change', handleTrackingChange);
    return;
  }
  
  // 表示位置を特定 - estimateResultの近く
  const estimateResult = document.getElementById('estimateResult');
  if (!estimateResult) return;
  
  // チェックボックス用のコンテナを作成
  const checkboxContainer = document.createElement('div');
  checkboxContainer.className = 'tracking-checkbox-container';
  checkboxContainer.style.margin = '10px 0';
  
  // チェックボックスを作成
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'trackingCheckbox';
  checkbox.checked = isTrackingEnabled;
  
  // イベントリスナーを追加
  checkbox.addEventListener('change', handleTrackingChange);
  
  // ラベルを作成
  const label = document.createElement('label');
  label.htmlFor = 'trackingCheckbox';
  label.textContent = '連続する結果を保持(個体絞り込み)';
  label.style.marginLeft = '5px';
  
  // 要素を追加
  checkboxContainer.appendChild(checkbox);
  checkboxContainer.appendChild(label);
  
  // estimateResultの前に挿入
  if (estimateResult.parentNode) {
    estimateResult.parentNode.insertBefore(checkboxContainer, estimateResult);
  }
}

// チェックボックス変更時の処理を独立した関数に
function handleTrackingChange() {
  isTrackingEnabled = this.checked;
  
  // チェックが外れた場合、累積データをリセットして青いブロックを非表示にする
  if (!isTrackingEnabled) {
    console.log("累積データをリセットします");
    
    // 累積データのリセット
    resetRangeData();
    
    // すべての青いブロックを非表示に
    const resultBlocks = document.querySelectorAll('.highlighted-result');
    resultBlocks.forEach(block => {
      block.style.display = 'none';
      block.innerHTML = ''; // 内容もクリア
    });
    
    // 個別の要素も明示的に非表示に
    const physicalBlock = document.getElementById('physicalResultBlock');
    const specialBlock = document.getElementById('specialResultBlock');
    const highlightedResult = document.getElementById('highlightedResult');
    const secondResultBlock = document.getElementById('secondResultBlock');
    
    if (physicalBlock) {
      physicalBlock.style.display = 'none';
      physicalBlock.innerHTML = '';
    }
    
    if (specialBlock) {
      specialBlock.style.display = 'none';
      specialBlock.innerHTML = '';
    }
    
    if (highlightedResult) {
      highlightedResult.style.display = 'none';
      highlightedResult.innerHTML = '';
    }
    
    if (secondResultBlock) {
      secondResultBlock.style.display = 'none';
      secondResultBlock.innerHTML = '';
    }
  }
}

// 累積データをリセットする関数も修正
function resetRangeData() {
  
  // 物理と特殊の両方のデータをリセット
  physicalRangeMin = 0;
  physicalRangeMax = 999;
  specialRangeMin = 0;
  specialRangeMax = 999;
  
  // 互換性のための変数も更新
  cumulativeMinAtk = 0;
  cumulativeMaxAtk = 999;
}

// 強調表示用の要素を作成する関数
function createHighlightedResultIfNeeded() {
  // すでに存在する場合は作成しない
  if (document.getElementById('highlightedResult')) {
    return document.getElementById('highlightedResult');
  }
  
  // 表示位置を特定 - estimateResultの上
  const estimateResult = document.getElementById('estimateResult');
  if (!estimateResult) return null;
  
  // 強調表示用のコンテナを作成
  const highlightedContainer = document.createElement('div');
  highlightedContainer.id = 'highlightedResult';
  highlightedContainer.className = 'highlighted-result';
  highlightedContainer.style.padding = '10px';
  highlightedContainer.style.marginBottom = '10px';
  highlightedContainer.style.backgroundColor = '#f0f8ff'; // 薄い青色
  highlightedContainer.style.border = '1px solid #add8e6'; // 薄い青色の枠
  highlightedContainer.style.borderRadius = '5px';
  highlightedContainer.style.fontWeight = 'bold';
  highlightedContainer.style.display = 'none'; // 初期状態では非表示
  
  // estimateResultの前に挿入
  if (estimateResult.parentNode) {
    estimateResult.parentNode.insertBefore(highlightedContainer, estimateResult);
  }
  
  return highlightedContainer;
}

// テキストエリアを削除する関数
function removeHistoryTextarea() {
  // テキストエリアとリセットボタンのコンテナを削除
  const historyContainer = document.querySelector('.history-container');
  if (historyContainer) {
    historyContainer.remove(); // parentNodeを使わずにdirectに削除
  }
  
  // テキストエリア自体を削除
  const historyTextarea = document.getElementById('resultHistory');
  if (historyTextarea) {
    historyTextarea.remove(); // parentNodeを使わずにdirectに削除
  }
  
  // 以降の処理は行わない（estimateIVFromDamageへの呼び出しを防止）
}

// ========================
// 9. 青い結果ブロック管理関数
// ========================

// 青いブロックの表示順を制御する共通関数
function updateResultBlocksOrder() {
  // 結果ブロックを表示する親要素を取得
  const resultsSection = document.querySelector('.results-section') || 
                         document.getElementById('estimateResult').parentNode;
  if (!resultsSection) return;
  
  // 計算結果見出し（h2）を特定
  const resultHeading = resultsSection.querySelector('h2');
  const resultBorder = resultHeading ? resultHeading.nextElementSibling : null;
  
  // 各ブロックへの参照を取得
  const physicalBlock = document.getElementById('physicalResultBlock');
  const specialBlock = document.getElementById('specialResultBlock');
  const giveBlock = document.getElementById('giveResultBlock');
  
  // 順序を追跡するタイムスタンプ属性を確認する
  const getBlockTimestamp = (block) => {
    if (!block) return 0;
    return parseInt(block.getAttribute('data-timestamp') || '0');
  };
  
  // 存在するブロックを時間順に並べる（新しいものが上に来るように）
  const blocks = [];
  if (physicalBlock && physicalBlock.style.display !== 'none') blocks.push(physicalBlock);
  if (specialBlock && specialBlock.style.display !== 'none') blocks.push(specialBlock);
  if (giveBlock && giveBlock.style.display !== 'none') blocks.push(giveBlock);
  
  // タイムスタンプで降順ソート（新しいものが先頭に）
  blocks.sort((a, b) => {
    return getBlockTimestamp(b) - getBlockTimestamp(a);
  });
  
  // DOM内の位置を再配置
  if (blocks.length > 0 && resultBorder) {
    // 見出しとボーダーの後に最新の結果から順番に配置する
    for (let i = 0; i < blocks.length; i++) {
      if (i === 0) {
        // 最初のブロックはボーダーの直後に配置
        resultBorder.after(blocks[i]);
      } else {
        // 残りのブロックは順番に配置
        blocks[i-1].after(blocks[i]);
      }
    }
  } else if (blocks.length > 0) {
    // 見出しが見つからない場合の代替処理
    for (let i = 1; i < blocks.length; i++) {
      blocks[i-1].after(blocks[i]);
    }
  }
}

// 物理と特殊を常に別々のブロックで表示する関数
function manageResultBlocks(isPhysical, resultText) {
  // 使用するブロックIDを決定
  const blockId = isPhysical ? 'physicalResultBlock' : 'specialResultBlock';
  
  // 結果ブロックを表示する親要素を取得
  const resultsSection = document.querySelector('.results-section') || 
                         document.getElementById('estimateResult').parentNode;
  
  // 物理用のブロックを確認/作成
  let physicalBlock = document.getElementById('physicalResultBlock');
  if (!physicalBlock) {
    physicalBlock = document.createElement('div');
    physicalBlock.id = 'physicalResultBlock';
    physicalBlock.className = 'highlighted-result';
    physicalBlock.style.padding = '10px';
    physicalBlock.style.marginBottom = '4px'; // マージンを4pxに
    physicalBlock.style.backgroundColor = '#f0f8ff';
    physicalBlock.style.border = '1px solid #add8e6';
    physicalBlock.style.borderRadius = '5px';
    physicalBlock.style.fontWeight = 'bold';
    physicalBlock.style.textAlign = 'center'; // 中央揃え
    
    // タイムスタンプ属性を追加（0 = 最も古い）
    physicalBlock.setAttribute('data-timestamp', '0');
    
    // 親要素に追加（位置はupdateResultBlocksOrderで調整）
    if (resultsSection) {
      resultsSection.appendChild(physicalBlock);
    }
  }
  
  // 特殊用のブロックを確認/作成
  let specialBlock = document.getElementById('specialResultBlock');
  if (!specialBlock) {
    specialBlock = document.createElement('div');
    specialBlock.id = 'specialResultBlock';
    specialBlock.className = 'highlighted-result';
    specialBlock.style.padding = '10px';
    specialBlock.style.marginBottom = '4px'; // マージンを4pxに
    specialBlock.style.backgroundColor = '#f0f8ff';
    specialBlock.style.border = '1px solid #add8e6';
    specialBlock.style.borderRadius = '5px';
    specialBlock.style.fontWeight = 'bold';
    specialBlock.style.textAlign = 'center'; // 中央揃え
    
    // タイムスタンプ属性を追加（0 = 最も古い）
    specialBlock.setAttribute('data-timestamp', '0');
    
    // 親要素に追加（位置はupdateResultBlocksOrderで調整）
    if (resultsSection) {
      resultsSection.appendChild(specialBlock);
    }
  }
  
  // 更新対象のブロックを取得
  const targetBlock = isPhysical ? physicalBlock : specialBlock;
  
  // 現在のタイムスタンプを更新（ミリ秒）
  targetBlock.setAttribute('data-timestamp', Date.now().toString());
  
  // ブロックの内容をクリア
  targetBlock.innerHTML = '';
  
  // 見出しを追加
  const headingText = isPhysical ? '物理技の結果' : '特殊技の結果';
  const heading = document.createElement('div');
  heading.className = 'result-heading';
  heading.style.fontWeight = 'bold';
  heading.style.marginBottom = '5px';
  heading.style.color = '#0066cc';
  heading.style.textAlign = 'center'; // 中央揃え
  heading.textContent = headingText;
  targetBlock.appendChild(heading);
  
  // 結果テキストを追加
  const contentNode = document.createElement('div');
  contentNode.style.textAlign = 'center'; // 内容も中央揃え
  contentNode.innerHTML = resultText;
  // 既に見出しが含まれている場合は削除
  const existingHeading = contentNode.querySelector('.result-heading');
  if (existingHeading) {
    existingHeading.remove();
  }
  targetBlock.innerHTML += contentNode.innerHTML;
  
  // 計算がされていないブロックは非表示
  if (physicalBlock.innerHTML === '' || physicalBlock.innerHTML === '<div class="result-heading" style="font-weight: bold; margin-bottom: 5px; color: rgb(0, 102, 204); text-align: center;">物理技の結果</div>') {
    physicalBlock.style.display = 'none';
  } else {
    physicalBlock.style.display = 'block';
  }
  
  if (specialBlock.innerHTML === '' || specialBlock.innerHTML === '<div class="result-heading" style="font-weight: bold; margin-bottom: 5px; color: rgb(0, 102, 204); text-align: center;">特殊技の結果</div>') {
    specialBlock.style.display = 'none';
  } else {
    specialBlock.style.display = 'block';
  }
  
  // 通常の結果は非表示
  const estimateResult = document.getElementById('estimateResult');
  if (estimateResult) {
    estimateResult.style.display = 'none';
  }
  
  // 表示順序を更新
  updateResultBlocksOrder();
}
// 物理と特殊を常に別々のブロックで表示する関数
function manageResultBlocks(isPhysical, resultText) {
  // 使用するブロックIDを決定
  const blockId = isPhysical ? 'physicalResultBlock' : 'specialResultBlock';
  
  // 結果ブロックを表示する親要素を取得
  const resultsSection = document.querySelector('.results-section') || 
                         document.getElementById('estimateResult').parentNode;
  
  // 物理用のブロックを確認/作成
  let physicalBlock = document.getElementById('physicalResultBlock');
  if (!physicalBlock) {
    physicalBlock = document.createElement('div');
    physicalBlock.id = 'physicalResultBlock';
    physicalBlock.className = 'highlighted-result';
    physicalBlock.style.padding = '10px';
    physicalBlock.style.marginBottom = '4px'; // マージンを4pxに
    physicalBlock.style.backgroundColor = '#f0f8ff';
    physicalBlock.style.border = '1px solid #add8e6';
    physicalBlock.style.borderRadius = '5px';
    physicalBlock.style.fontWeight = 'bold';
    physicalBlock.style.textAlign = 'center'; // 中央揃え
    
    // タイムスタンプ属性を追加（0 = 最も古い）
    physicalBlock.setAttribute('data-timestamp', '0');
    
    // estimateResultの前に挿入
    if (resultsSection) {
      resultsSection.insertBefore(physicalBlock, resultsSection.firstChild);
    }
  }
  
  // 特殊用のブロックを確認/作成
  let specialBlock = document.getElementById('specialResultBlock');
  if (!specialBlock) {
    specialBlock = document.createElement('div');
    specialBlock.id = 'specialResultBlock';
    specialBlock.className = 'highlighted-result';
    specialBlock.style.padding = '10px';
    specialBlock.style.marginBottom = '4px'; // マージンを4pxに
    specialBlock.style.backgroundColor = '#f0f8ff';
    specialBlock.style.border = '1px solid #add8e6';
    specialBlock.style.borderRadius = '5px';
    specialBlock.style.fontWeight = 'bold';
    specialBlock.style.textAlign = 'center'; // 中央揃え
    
    // タイムスタンプ属性を追加（0 = 最も古い）
    specialBlock.setAttribute('data-timestamp', '0');
    
    // 親要素の先頭に挿入
    if (resultsSection) {
      resultsSection.insertBefore(specialBlock, resultsSection.firstChild);
    }
  }
  
  // 更新対象のブロックを取得
  const targetBlock = isPhysical ? physicalBlock : specialBlock;
  
  // 現在のタイムスタンプを更新（ミリ秒）
  targetBlock.setAttribute('data-timestamp', Date.now().toString());
  
  // ブロックの内容をクリア
  targetBlock.innerHTML = '';
  
  // 見出しを追加
  const headingText = isPhysical ? '物理技の結果' : '特殊技の結果';
  const heading = document.createElement('div');
  heading.className = 'result-heading';
  heading.style.fontWeight = 'bold';
  heading.style.marginBottom = '5px';
  heading.style.color = '#0066cc';
  heading.style.textAlign = 'center'; // 中央揃え
  heading.textContent = headingText;
  targetBlock.appendChild(heading);
  
  // 結果テキストを追加
  const contentNode = document.createElement('div');
  contentNode.style.textAlign = 'center'; // 内容も中央揃え
  contentNode.innerHTML = resultText;
  // 既に見出しが含まれている場合は削除
  const existingHeading = contentNode.querySelector('.result-heading');
  if (existingHeading) {
    existingHeading.remove();
  }
  targetBlock.innerHTML += contentNode.innerHTML;
  
  // 計算がされていないブロックは非表示
  if (physicalBlock.innerHTML === '' || physicalBlock.innerHTML === '<div class="result-heading" style="font-weight: bold; margin-bottom: 5px; color: rgb(0, 102, 204); text-align: center;">物理技の結果</div>') {
    physicalBlock.style.display = 'none';
  } else {
    physicalBlock.style.display = 'block';
  }
  
  if (specialBlock.innerHTML === '' || specialBlock.innerHTML === '<div class="result-heading" style="font-weight: bold; margin-bottom: 5px; color: rgb(0, 102, 204); text-align: center;">特殊技の結果</div>') {
    specialBlock.style.display = 'none';
  } else {
    specialBlock.style.display = 'block';
  }
  
  // 通常の結果は非表示
  const estimateResult = document.getElementById('estimateResult');
  if (estimateResult) {
    estimateResult.style.display = 'none';
  }
  
  // 表示順序を更新
  updateResultBlocksOrder();
}

// ========================
// 10. ダメージ計算関数
// ========================

/**
ダメージ計算の内部実装
@param {number} attack - 攻撃値
@param {number} defenseValue - 防御値
@param {number} level - レベル
@param {number} powerValue - 技の威力
@param {string} categoryType - 技のカテゴリ ('Physical'/'Special')
@param {string} moveType - 技のタイプ
@param {Array} attackerTypes - 攻撃側のタイプ配列
@param {Array} defenderTypes - 防御側のタイプ配列
@param {boolean} isDarkPokemon - ダークポケモンかどうか
@param {boolean} min - 最小ダメージ計算するかどうか
@param {number} atkRank - 攻撃ランク補正
@param {number} defRank - 防御ランク補正
@returns {number} - 計算されたダメージ値
*/
function calculateDamage(attack, defenseValue, level, powerValue, categoryType, moveType, attackerTypes, defenderTypes,
  isDarkPokemon, atkRank = 0, defRank = 0) {

  let finalAttack = attack;
  let finalDefense = defenseValue;
  let finalPower = powerValue;

  // ヨガパワー
  const isYogaPower = document.getElementById('YogaPowerCheck') && 
                      document.getElementById('YogaPowerCheck').checked;
  if (isYogaPower && categoryType === "Physical") {
    finalAttack = Math.floor(finalAttack * 2);
    //console.log(`ヨガパワー効果適用: 攻撃値が2倍 -> ${finalAttack}`);
  }
  // ちからもち

  // バッジ補正
  const atkBadgeBoostChecked = document.getElementById('badgeBoostCheck') && 
  document.getElementById('badgeBoostCheck').checked;

  // 攻撃値にバッジ補正を適用
  if (atkBadgeBoostChecked && isPlayerAttack) {
    finalAttack = Math.round(finalAttack * 110 / 100);
    //console.log(`バッジ補正後の攻撃値: ${finalAttack}`);
  }

  // 被ダメ計算側のバッジ補正をチェック
  const defBadgeBoostChecked = document.getElementById('defBadgeBoostCheck') && 
  document.getElementById('defBadgeBoostCheck').checked;
  
  // 防御側のバッジ補正を適用
  if (defBadgeBoostChecked && !isPlayerAttack) {
    finalDefense = Math.floor(finalDefense * 110 / 100);
    //console.log(`バッジ補正後の防御値: ${finalDefense}`);
  }

  // アイテム補正
  if (currentItem) {
    // アイテムと技のタイプが一致するか
    const isTypeMatch = !currentItem.type || currentItem.type === moveType;
    if (isTypeMatch && currentItem.timing === "attackMod") {
      // 物理か特殊かどちらに補正するか
      const modifier = categoryType === "Physical" ? (currentItem.a || 1.0) : (currentItem.c || 1.0);
      finalAttack = Math.floor(finalAttack * modifier);
    }
  }
  
  // ステータス補正の特性
  // あついしぼう
  // はりきり
  const isHarikiri = document.getElementById('harikiriCheck') && 
  document.getElementById('harikiriCheck').checked;
  if (isHarikiri && categoryType === "Physical") {
  finalAttack = Math.floor(finalAttack * 150/100);
  console.log(`はりきり: A実数値が1.5倍 -> ${finalAttack}`);
  }
  // プラス
  // マイナス
  // こんじょう
  // ふしぎなうろこ

  // どろあそび・みずあそび
  //
  // finalPower = Math.floor(finalPower / 2);

  // しんりょく
  const isShinryoku = document.getElementById('shinryokuCheck') && 
  document.getElementById('shinryokuCheck').checked;
  if (isShinryoku && moveType === "くさ") {
    finalPower = Math.floor(finalPower * 150/100);
    console.log(`しんりょく: 草技の威力が1.5倍 -> ${finalPower}`);
  }
  // もうか
  const isMouka = document.getElementById('moukaCheck') && 
  document.getElementById('moukaCheck').checked;
  if (isMouka && moveType === "ほのお") {
    finalPower = Math.floor(finalPower * 150/100);
    console.log(`もうか: 炎技の威力が1.5倍 -> ${finalPower}`);
  }
  // げきりゅう
  const isGekiryuu = document.getElementById('gekiryuuCheck') && 
  document.getElementById('gekiryuuCheck').checked;
  if (isGekiryuu && moveType === "みず") {
    finalPower = Math.floor(finalPower * 150/100);
    console.log(`げきりゅう: 水技の威力が1.5倍 -> ${finalPower}`);
  }
  // むしのしらせ
  const isMushiNoShirase = document.getElementById('mushiNoShiraseCheck') && 
  document.getElementById('mushiNoShiraseCheck').checked;
  if (isMushiNoShirase && moveType === "むし") {
    finalPower = Math.floor(finalPower * 150/100);
    console.log(`もうか: 炎技の威力が1.5倍 -> ${finalPower}`);
  }

  // 爆発の防御半減（だいばくはつ、じばく）
  const moveInfo = findMoveInfo(document.getElementById('searchMyMove').value);
  const moveClass = moveInfo ? moveInfo.class || "standard" : "standard";
  
  if (moveClass === "b_harf") {
    finalDefense = Math.floor(finalDefense / 2);
    //console.log(`爆発は防御半減 -> ${finalDefense}`);
  }
  
  // ランク補正
  const atkRankMultiplier = atkRank >= 0 ? (2 + atkRank) / 2 : 2 / (2 - atkRank);
  const defRankMultiplier = defRank >= 0 ? (2 + defRank) / 2 : 2 / (2 - defRank);
  
  finalAttack = Math.floor(finalAttack * atkRankMultiplier);
  finalDefense = Math.floor(finalDefense * defRankMultiplier);

  // A: レベル計算
  const A = Math.floor(level * 2 / 5) + 2;
  
  // B: 基本ダメージ計算
  let B = Math.floor((finalAttack * finalPower * A) / finalDefense);

  let C = Math.floor(B / 50);
  
  // D: 火傷・壁・範囲・天候補正
  let D = C;
  
  // 火傷補正（物理技のみ）
  const isBurned = document.getElementById('burnCheck') && document.getElementById('burnCheck').checked;
  if (isBurned && categoryType === "Physical") {
    D = Math.floor(D * 0.5);
  }
  
  // 壁補正
  const hasWall = document.getElementById('wallCheck') && document.getElementById('wallCheck').checked;

  if (hasWall) {
    const wallDiv = isDoubleBattle ? 1.5 : 2;
    D = Math.floor(D / wallDiv);
  }
  
  // 範囲補正（全体技）
  const isDoubleBattle = document.getElementById('doubleCheck') && document.getElementById('doubleCheck').checked;
  
  const targetType = moveInfo ? moveInfo.target || 1 : 1;
  if (targetType === 2 && isDoubleBattle) {
    D = Math.floor(D / 2);
  }
  
  // 天候補正
  const weather = document.getElementById('weatherSelect') ? document.getElementById('weatherSelect').value : 'normal';
  
  if (weather === 'sunny' && moveType === 'ほのお') {
    D = Math.floor(D * 1.5);
  } else if (weather === 'sunny' && moveType === 'みず') {
    D = Math.floor(D * 0.5);
  } else if (weather === 'rain' && moveType === 'みず') {
    D = Math.floor(D * 1.5);
  } else if (weather === 'rain' && moveType === 'ほのお') {
    D = Math.floor(D * 0.5);
  } else if (weather === 'darkness' && moveType === 'ダーク') {
    D = Math.floor(D * 1.5);
  }
  // 貰い火
  //

  D += 2;

  // 急所
  const isCritical = document.getElementById('CriticalCheck') && document.getElementById('CriticalCheck').checked;
  if (isCritical) {
    D = Math.floor(D * 2);
  }

  // 充電
  //

  // 手助け
  //

  // タイプ一致補正
  let stab = attackerTypes.includes(moveType) ? 1.5 : 1.0;
  
  D = Math.floor(D * stab);
  
  // タイプ相性計算
  let typeEffectiveness = 1.0;
  
  // ダークタイプの特殊処理
  const isDarknessActive = document.getElementById('darknessCheck') && document.getElementById('darknessCheck').checked;
  
  if (moveType === "ダーク") {
    if (isDarkPokemon) {
      // ダークポケモンの場合、ダーク技は半減（0.5倍）
      typeEffectiveness = 0.5;
    } else {
      // 非ダークポケモンの場合、ダーク技は抜群（2倍）
      typeEffectiveness = 2.0;
    }
    
    // くらやみ状態の場合、ダーク技は1.5倍
    if (isDarknessActive) {
      typeEffectiveness *= 1.5;
      console.log(`くらやみ状態のダーク技: さらに1.5倍 -> ${typeEffectiveness}倍`);
    }
  }
  else if (defenderTypes.length > 0) {
    // 通常のタイプ相性計算（ダーク技以外）
    typeEffectiveness = defenderTypes.reduce((effectiveness, defType) => {
      if (typeMultiplierData[moveType] && typeMultiplierData[moveType][defType]) {
        return effectiveness * typeMultiplierData[moveType][defType];
      }
      return effectiveness;
    }, 1.0);
  }
  
  // タイプ相性補正を適用
  D = Math.floor(D * typeEffectiveness);
  
  // 基本ダメージを保存（乱数適用前）
  let baseDamage = Math.max(1, D);
  
  // 最小ダメージ（0.85倍）
  let minDamage = Math.floor(baseDamage * 0.85);
  minDamage = Math.max(1, minDamage); // 最低ダメージは1
  
  // 最大ダメージ（そのまま）
  let maxDamage = baseDamage;
  
  // [最小値, 最大値]の配列を返す
  return [minDamage, maxDamage];
}

/*
与ダメ計算の実装
*/
function performGiveDamageCalculation() {
  isPlayerAttack = true;

  // 各セクション説明非表示
  const damageTips = document.querySelectorAll('.damage-tips');
  damageTips.forEach(tip => {
    tip.style.display = 'none';
  });

  // 前回の結果がダメージ保持モードかチェック
  const isPrevDamageKept = sessionStorage.getItem('keepDamage') === 'true';
  
  // 前回の結果を履歴に追加（2回目以降の計算時のみ）
  if (isPrevDamageKept) {
    const prevMinDamage = parseInt(sessionStorage.getItem('currentMinDamage') || '0');
    const prevMaxDamage = parseInt(sessionStorage.getItem('currentMaxDamage') || '0');
    const prevTotalHP = parseInt(sessionStorage.getItem('currentTotalHP') || '0');
    
    if (prevMinDamage > 0 && prevMaxDamage > 0 && prevTotalHP > 0) {
      manageDamageHistory(prevMinDamage, prevMaxDamage, prevTotalHP);
      console.log(`前回の結果を履歴に追加: ${prevMinDamage}～${prevMaxDamage}ダメージ`);
    }
  }

  // 与ダメ計算に必要な情報を取得
  let attackerLevel = parseInt(document.getElementById('level').value) || 50;
  let attackValue = parseInt(document.getElementById('atk').value) || 0;
  const moveInput = document.getElementById('searchMyMove').value;
  const itemInput = document.getElementById('searchItem').value;
  
  // 戦闘条件の取得
  const atkRank = parseInt(document.getElementById('selfAtkRank').value) || 0;
  const defRank = parseInt(document.getElementById('targetDefRank').value) || 0;
  
  // 相手ポケモン情報
  const defenderName = document.getElementById('searchPokemon').value;
  const defenderLevel = parseInt(document.getElementById('defLevel').value) || 50;
  
  // 相手のステータスを取得（レベル補正後の値を使用）
  let defenseValue = 0;
  let defenderHP = 0;
  
  if (currentPokemonName) {
    // ステータス表示から防御値とHPを取得
    const baseStatsDiv = document.getElementById('baseStats');
    if (baseStatsDiv && baseStatsDiv.innerHTML) {
      try {
        // ステータス表示から値を抽出
        let statsText = baseStatsDiv.innerText;
        
        // レベル補正がある場合は2行目を使用
        const statLines = statsText.split('\n');
        
        // 最後の数値行を検索（レベル補正表示の下の行）
        let targetLine = '';
        for (let i = statLines.length - 1; i >= 0; i--) {
          if (statLines[i].includes('-')) {
            targetLine = statLines[i];
            break;
          }
        }
        
        if (targetLine) {
          const targetStats = targetLine.split('-');
          
          if (targetStats.length >= 6) {
            // HPを取得
            defenderHP = parseInt(targetStats[0].replace(/\D/g, ''));
            
            // 技が物理か特殊かで防御値を選択
            const moveInfo = findMoveInfo(moveInput);
            if (moveInfo) {
              if (moveInfo.category === 'Physical') {
                // 物理技の場合はB
                defenseValue = parseInt(targetStats[2].replace(/\D/g, ''));
              } else if (moveInfo.category === 'Special') {
                // 特殊技の場合はD
                defenseValue = parseInt(targetStats[4].replace(/\D/g, ''));
              }
              else {
                // 変化技はStatus
                defenseValue = 1;
              }
            }
          }
        }
      } catch (e) {
        console.error('ステータス解析エラー:', e);
      }
    }
  }
  
  if (!defenseValue) {
    console.error('相手の防御値が取得できませんでした');
    alert('相手の防御値が取得できませんでした。相手ポケモンを選択してください。');
    return;
  }
  
  if (!defenderHP) {
    // HPが取得できない場合は100と仮定
    defenderHP = 100;
    console.log('相手HP取得できず、100として計算します');
  }
  
  // 自分ポケモン情報
  let attackerName = document.getElementById('searchMyPokemon').value;
  if (!attackerName) {
    alert('自分ポケモンを選択してください');
    return;
  }
  
  // 技情報を取得
  const moveInfo = findMoveInfo(moveInput);
  if (!moveInfo) {
    alert('技を選択してください');
    return;
  }
  
  let power = moveInfo.power || 0;
  let category = moveInfo.category || "Physical";
  let moveType = moveInfo.type || "";
  let moveClass = moveInfo.class || "standard";
  
  let itemInfo = null;
  if (itemInput) {
    itemInfo = findItemInfo(itemInput);
    console.log('持ち物情報:', itemInfo);
    
    // currentItemの設定（追加）
    if (itemInfo) {
      currentItem = itemInfo;
    } else {
      currentItem = null;
      console.log('持ち物情報が見つかりません:', itemInput);
    }
  }
  
  // 自分ポケモンのタイプを取得
  const attackerInfo = findPokemonInfo(attackerName);
  const attackerTypes = attackerInfo ? 
    (Array.isArray(attackerInfo.type) ? attackerInfo.type : [attackerInfo.type]) : 
    [];
  
  // 相手ポケモンのタイプを取得
  const defenderInfo = findPokemonInfo(defenderName);
  const defenderTypes = defenderInfo ? 
    (Array.isArray(defenderInfo.type) ? defenderInfo.type : [defenderInfo.type]) : 
    [];
  
  // 固定ダメージ技の処理
  let isFixedDamage = false;
  let fixedDamage = 0;
  let damageDescription = '';
  let minDamage, maxDamage;
  
  // 固定ダメージ処理（この部分はそのまま残す）
  if (moveClass === "fixed") {
    isFixedDamage = true;
    // 固定値が数値なら直接使用
    if (typeof moveInfo.fixed_value === 'number') {
      fixedDamage = moveInfo.fixed_value;
      damageDescription = `固定ダメ:${fixedDamage}`;
    } 
    // レベル固定なら攻撃側レベルをダメージとする
    else if (moveInfo.fixed_value === "level") {
      fixedDamage = attackerLevel;
      damageDescription = `固定ダメ(Lv):${fixedDamage}`;
    }
    // それ以外の場合はデフォルト処理に戻す
    else {
      isFixedDamage = false;
    }
  }
  // いたみわけの処理
  else if (moveClass === "itamiwake") {
    isFixedDamage = true;
    // 自分のHPと相手のHPの平均を計算
    const averageHP = Math.floor((attackValue + defenderHP) / 2);

    if (averageHP >= defenderHP) {
      //最大HPを超えて回復することはできないため
      fixedDamage = 0;
    } else {
      // ダメージは相手の最大HP - 平均HP
      fixedDamage = Math.max(0, defenderHP - averageHP);
      damageDescription = `いたみわけダメージ: ${fixedDamage}`;
    }
    damageDescription = `(自HP+敵HP)÷2`;
  }
  // のろいの処理
  else if (moveClass === "noroi") {
    isFixedDamage = true;
    // 相手の最大HPの1/4のダメージ
    fixedDamage = Math.floor(defenderHP / 4);
    damageDescription = `HP÷4`;
  }
  // 反動技の処理
  else if (moveClass === "recoil") {
    isFixedDamage = true;
    
    // 入力値を取得
    const sutemiMaxHP = parseInt(document.getElementById('sutemiTackle_maxHP').value) || 0;
    const sutemiCurrentHP = parseInt(document.getElementById('sutemiTackle_currentHP').value) || 0;
    
    // 与えたダメージを計算（最大HP - 現在HP）
    const dealtDamage = sutemiMaxHP - sutemiCurrentHP;
    
    // 与えたダメージの1/3を反動ダメージとして計算
    fixedDamage = Math.floor(dealtDamage / 3);
    damageDescription = `ダメージ÷3`;
  }
  // "harf"（半減）の処理（いかりのまえば、ダークハーフ、ダークエンドの自傷）
  else if (moveClass === "harf") {
    isFixedDamage = true;
    
    // 現在HPを取得（ダメージ履歴を考慮）
    let currentHP = defenderHP; // デフォルトは最大HP
    
    // ダメージ保持モードの場合は累積ダメージを考慮
    if (sessionStorage.getItem('keepDamage') === 'true') {
      try {
        const damageHistoryJSON = sessionStorage.getItem('damageHistory');
        if (damageHistoryJSON) {
          const damageHistory = JSON.parse(damageHistoryJSON);
          let accumulatedDamage = 0;
          for (const entry of damageHistory) {
            accumulatedDamage += entry.minDamage;
          }
          currentHP = Math.max(1, defenderHP - accumulatedDamage);
        }
      } catch (e) {
        console.error('履歴解析エラー:', e);
      }
    }
    
    // 現在HPの1/2のダメージ
    fixedDamage = Math.floor(currentHP / 2);
    damageDescription = `HP÷2`;
  }
  // ダークラッシュ(Co)の自傷ダメージ
  else if (moveClass === "self_damage") {
    isFixedDamage = false;
    // 相手の最大HPの1/16のダメージを基準にする
    const baseDamage = Math.floor(defenderHP / 16);
    // 最小ダメージと最大ダメージを設定
    const minSelfDamage = Math.max(1, baseDamage - 1); // 最低1ダメージ
    const maxSelfDamage = baseDamage + 1;

    minDamage = minSelfDamage;
    maxDamage = maxSelfDamage;
    
    damageDescription = `(HP÷16)±1`;
  }
  // こんらん
  else if(moveClass === "self_damage2") {
    // self_damage2の処理（そのまま残す）
    // 被ダメ計算セクションのポケモン情報を取得
    const defPokemonName = document.getElementById('searchDefPokemon').value;
    if (!defPokemonName) {
      console.log("被ダメ計算セクションのポケモンが設定されていません");
      return;
    }
    
    // 被ダメ計算セクションからステータス情報を取得
    const baseStatsElem = document.getElementById('baseStats');
    if (!baseStatsElem || !baseStatsElem.textContent) {
      console.log("ステータス情報が表示されていません");
      return;
    }
    
    // ステータス表示からA値を抽出
    let attackStat = 0;
    
    // ステータス表示テキストを取得
    let statsText = baseStatsElem.textContent;
    
    // レベル補正の有無をチェック
    hasLevelBoost = statsText.includes('[レベル補正');
    
    // レベル補正がある場合は補正後の値を取得
    if (hasLevelBoost) {
      // 補正後のステータス行を取得（最後の行）
      const lines = statsText.split('\n');
      let statsLine = '';
      
      // 最後の数値行を検索
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes('-')) {
          statsLine = lines[i];
          break;
        }
      }
      
      if (statsLine) {
        // HP-A-B-C-D-S の形式から攻撃値(A)を抽出
        const statValues = statsLine.split('-');
        if (statValues.length >= 2) {
          attackStat = parseInt(statValues[1].replace(/\D/g, ''));
        }
      }
    } else {
      // 補正なしの場合は最初の行から取得
      const statValues = statsText.split('-');
      if (statValues.length >= 2) {
        attackStat = parseInt(statValues[1].replace(/\D/g, ''));
      }
    }
    
    // 被ダメ計算側のレベル
    defLevel = parseInt(document.getElementById('defLevel').value) || 50;
    
    // 技情報から必要な値を取得 (pokemon_moves.jsonに記載されているものを使用)
    const moveInfo = moveData.find(m => m.class === "self_damage2");
    
    power = moveInfo.power; // 技のpower値
    moveType = moveInfo.type; // 技のtype値
    category = moveInfo.category; // 技のcategory値

    // ステータス表示から全テキストを取得
    statsText = baseStatsElem.textContent;
    
    // レベル補正があるかチェック
    const hasCorrection = statsText.includes('[レベル補正');
    
    // レベル補正後のステータス値を取得
    if (hasCorrection) {
      // レベル補正の位置を見つける
      const correctionIndex = statsText.indexOf('[レベル補正');
 
      // レベル補正後の部分文字列を取得
      const afterCorrectionText = statsText.substring(correctionIndex);
      
      // ハイフンで区切られた数値を探す
      const match = afterCorrectionText.match(/(\d+)-(\d+)-(\d+)-(\d+)-(\d+)-(\d+)/);
      
      // 2番目の数値（A値）を取得
      const correctedAttackValue = parseInt(match[2]);
      finalAttackValue = correctedAttackValue;
      aStat = finalAttackValue;
      
    } else {
      // ハイフンで区切られた数値を探す
      const match = baseStatsElem.textContent.match(/(\d+)-(\d+)-(\d+)-(\d+)-(\d+)-(\d+)/);
      // レベル補正がない場合は通常のA値を使用
      finalAttackValue = parseInt(match[2]);
      aStat = finalAttackValue;
    }
    
    // attackerLevelとして被ダメ計算側のレベルを使用
    attackerLevel = defLevel;

    // ランク補正を取得
    atkRank = parseInt(document.getElementById('atkRank').value) || 0;
    
    // 防御ランク補正を取得
    defRank = parseInt(document.getElementById('defRank').value) || 0;

    // 結果表示書き換え
    attackerName = defenderName;
    attackValue = aStat;
  }
  // 最大HPの1/2のダメージ(とびひざげり外したとき)
  else if(moveClass === "harf_damage"){
    isFixedDamage = true;
    fixedDamage = Math.floor(defenderHP / 2);
    damageDescription = `HP÷2`;
  }

  let isDarkPokemon = false;
  if (currentOrigin === "XD") {
    isDarkPokemon = true;
  }
  
  let power_new = 0;

  if (isFixedDamage && moveClass != "self_damage") {
    // 固定ダメージの場合
    minDamage = fixedDamage;
    maxDamage = fixedDamage;
  }
  else if(moveClass === "self_damage"){
    // 何もしない
  }
  else if(moveClass === "pinch_up"){
    // きしかいせい・じたばた
    const currentHP = document.getElementById('pinchUp_currentHP').value;
    const maxHP = document.getElementById('pinchUp_maxHP').value;
    const HPrate = Math.floor(currentHP * 48 / maxHP);

    if(HPrate >= 33){
      power_new = 20;
    }
    else if(HPrate >= 17){
      power_new = 40;
    }
    else if(HPrate >= 10){
      power_new = 80;
    }
    else if(HPrate >= 5){
      power_new = 100;
    }
    else if(HPrate >= 2){
      power_new = 150;
    }
    else if(HPrate >= 0){
      power_new = 200;
    }
    
    const [min, max] = calculateDamage(
      attackValue, defenseValue, attackerLevel, power_new, category, moveType,
      attackerTypes, defenderTypes, isDarkPokemon, atkRank, defRank
    );
    minDamage = min;
    maxDamage = max;
  }
  else {
    // 通常のダメージ計算
    const [min, max] = calculateDamage(
      attackValue, defenseValue, attackerLevel, power, category, moveType,
      attackerTypes, defenderTypes, isDarkPokemon, atkRank, defRank
    );
    minDamage = min;
    maxDamage = max;
  }
  
  if(power_new != 0){
    power = power_new;
  }

  // 乱数表記を取得
  const randInfo = isFixedDamage ? 
    calculateRandText(minDamage, minDamage, defenderHP) : 
    calculateRandText(minDamage, maxDamage, defenderHP);
  
  // HPバーを作成
  const hpBarHtml = isFixedDamage ? 
    createHPBar(minDamage, minDamage, defenderHP) : 
    createHPBar(minDamage, maxDamage, defenderHP);
  
  // ダメージ情報を生成
  const damageInfoHtml = isFixedDamage ? 
    generateDamageInfo(minDamage, minDamage, defenderHP, randInfo.randLevel, randInfo.hits, randInfo.percent) : 
    generateDamageInfo(minDamage, maxDamage, defenderHP, randInfo.randLevel, randInfo.hits, randInfo.percent);
  
  // 基本の結果表示テキスト
  const isPhysical = category === "Physical";
  const isSpecial = category === "Special";
  let categoryDisplay = isPhysical ? '物理' : (isSpecial ? '特殊' : '-');
  
  let resultText;
  
  if (isFixedDamage) {
    resultText = `攻: ${attackerName} Lv.${attackerLevel}<br>` +
                 `防: ${defenderName} Lv.${defenderLevel}<br>` +
                 `(${moveInfo.name}/${moveType}/${damageDescription})`;
  } else if (categoryDisplay === '-') {
    // カテゴリが '-' の場合（変化技など）
    resultText = `攻: ${attackerName} Lv.${attackerLevel}<br>` +
                 `防: ${defenderName} Lv.${defenderLevel}<br>` +
                 `(${moveInfo.name}/${damageDescription})`;
  } else {
    // 通常の物理・特殊技の場合
    resultText = `攻: ${attackerName} Lv.${attackerLevel} ${isPhysical ? 'A' : 'C'}${attackValue}<br>` +
                 `防: ${defenderName} Lv.${defenderLevel} ${isPhysical ? 'B' : 'D'}${defenseValue}<br>` +
                 `(${moveInfo.name}:威力${power}/${moveType}/${categoryDisplay})`;
  }
  
  // 最終的な表示テキスト
  const fullResultText = resultText + '<br>' + hpBarHtml + damageInfoHtml;
  
  // 結果を表示
  displayResultInNewBlock(fullResultText, minDamage, maxDamage, defenderHP);
}

// ========================
// 11. ダメージ推定メイン関数
// ========================

// ダメージ計算結果をキャッシュするためのオブジェクト
const damageCalculationCache = {};

// キャッシュ機能付きダメージ計算関数
function calculateDamageWithCache(attack, defenseValue, level, powerValue, categoryType, moveType, 
                                 attackerTypes, defenderTypes, isDarkPokemon, atkRank = 0, defRank = 0) {
  // キャッシュキーを作成
  const cacheKey = `${attack}_${defenseValue}_${level}_${powerValue}_${categoryType}_${moveType}_` +
                  `${attackerTypes.join(',')}_${defenderTypes.join(',')}_${isDarkPokemon}_${atkRank}_${defRank}`;
  
  // キャッシュにあればそれを返す
  if (damageCalculationCache[cacheKey]) {
    return damageCalculationCache[cacheKey];
  }
  
  // なければ計算して結果をキャッシュする
  const result = calculateDamage(attack, defenseValue, level, powerValue, categoryType, moveType,
                               attackerTypes, defenderTypes, isDarkPokemon, atkRank, defRank);
  
  damageCalculationCache[cacheKey] = result;
  return result;
}

// キャッシュをリセットする関数
function resetDamageCalculationCache() {
  for (const key in damageCalculationCache) {
    delete damageCalculationCache[key];
  }
}

function ensureTypeMultiplierData() {
  if (window.typeMultiplierData) {
    return window.typeMultiplierData;
  }
  
  console.warn("タイプ相性データが読み込まれていません");
  return {};
}

function getPokemonBaseStats(pokemonName, category) {
  if (!pokemonName) {
    console.log("ポケモン名が指定されていません");
    return null;
  }
    
  // 全ポケモンデータからの検索（通常のフローバック）
  if (window.allPokemonData) {
    const pokemon = window.allPokemonData.find(p => p.name === pokemonName);
    if (pokemon && pokemon.basestats) {
      if (category === "Physical") {
        return pokemon.basestats[1]; // 攻撃
      } else {
        return pokemon.basestats[3]; // 特攻
      }
    }
  }
}


// 共通のダメージ計算ロジック
function calculateExactDamage(attack, defense, level, power, atkRankMod, defRankMod, totalModifier) {
  // ランク補正を適用
  const finalAttack = Math.floor(attack * atkRankMod);
  const finalDefense = Math.floor(defense * defRankMod);
  
  // ダメージ計算式
  const A = Math.floor(level * 2 / 5) + 2;
  const B = Math.floor((finalAttack * power * A) / finalDefense);
  const C = Math.floor(B / 50);
  let D = C + 2;
  
  // 総合補正を適用
  const finalDamage = Math.floor(D * totalModifier);
  
  return Math.max(1, finalDamage); // 最低1ダメージ
}

// 理論上の実数値を計算する関数（baseStat, IV, 性格補正から実数値を計算）
function calculateTheoreticalStat(baseStat, iv, level, natureModifier) {
  // 実数値 = floor((floor(種族値*2 + 個体値)*レベル/100) + 5) * 性格補正
  const part1 = Math.floor((baseStat * 2 + iv) * level / 100);
  const part2 = part1 + 5;
  const final = Math.floor(part2 * natureModifier);
  
  return final;
}

// 実数値範囲推定関数
function findStatByDamage(targetDamage, defValue, level, power, category, moveType,
  attackerTypes, defenderTypes, isDarkPokemon, atkRank, defRank) {
  
  // 補正なしダメージ計算関数を直接定義して使用
  function calculatePureAttackStat(targetDamage, isForMinDamage = false) {
    // 二分探索
    let min = 1;
    let max = 999;
    let bestStat = null;
    let iterations = 0;
  
    while (min <= max && iterations < 20) {  // 無限ループ防止
      iterations++;
      const mid = Math.floor((min + max) / 2);
  
      // 基本的なダメージ計算（補正なし）
      const A = Math.floor(level * 2 / 5) + 2;
      const effAttack = Math.floor(mid * (atkRank >= 0 ? (2 + atkRank) / 2 : 2 / (2 - atkRank)));
      const effDefense = Math.floor(defValue * (defRank >= 0 ? (2 + defRank) / 2 : 2 / (2 - defRank)));
  
      const B = Math.floor((effAttack * power * A) / effDefense);
      const C = Math.floor(B / 50);
      const D = C + 2;
  
      // 乱数補正のみ適用（85%～100%）
      const minDamage = Math.floor(D * 0.85);
      const maxDamage = D;
  
      // 判定条件
      if (isForMinDamage) {
        // 最小ダメージが目標以下になる最大の攻撃値を求める
        if (minDamage <= targetDamage) {
          bestStat = mid;
          min = mid + 1;  // より大きい攻撃値を探す
        } else {
          max = mid - 1;
        }
      } else {
        // 最大ダメージが目標以上になる最小の攻撃値を求める
        if (maxDamage >= targetDamage) {
          bestStat = mid;
          max = mid - 1;  // より小さい攻撃値を探す
        } else {
          min = mid + 1;
        }
      }
    }
  
    const result = bestStat || min;
    return result;
  }
  
  // 最大ダメージが目標以上になる最小の攻撃値を求める
  const minStat = calculatePureAttackStat(targetDamage, false);
  
  // 最小ダメージが目標以下になる最大の攻撃値を求める
  const maxStat = calculatePureAttackStat(targetDamage, true);
  
  return {
    min: minStat,
    max: maxStat
  };
}

// 被ダメージから個体値を推定する関数
function estimateIVFromDamage() {
  // 初期設定
  isPlayerAttack = false;

  removeHistoryTextarea();
  createHighlightedResultIfNeeded();
  const damageTips = document.querySelectorAll('.damage-tips');
  damageTips.forEach(tip => {
    tip.style.display = 'none';
  });
  const movesSelect = document.getElementById('movesSelect');
  const estimateResult = document.getElementById('estimateResult');
  const highlightedResult = document.getElementById('highlightedResult');
 
  // ランク補正の値を取得
  const atkRank = parseInt(document.getElementById('atkRank').value || 0);
  const defRank = parseInt(document.getElementById('defRank').value || 0);
  
  // 各種チェック状態取得
  const isDarkPokemon = document.getElementById('darkPokemonCheck') && document.getElementById('darkPokemonCheck').checked;
  const isDarknessActive = document.getElementById('darknessCheck') && document.getElementById('darknessCheck').checked;
  const isDoubleReduced = document.getElementById('defDoubleCheck') && document.getElementById('defDoubleCheck').checked;

  // 入力の検証
  if (!movesSelect || movesSelect.selectedIndex === -1) {
    if (estimateResult) estimateResult.innerHTML = "技を選択してください";
    if (highlightedResult) highlightedResult.style.display = 'none';
    return;
  }
  
  // 入力値の取得と検証
  const maxHP = parseInt(document.getElementById('maxHP').value) || 0;
  const currentHP = parseInt(document.getElementById('currentHP').value) || 0;
  let defValue = parseInt(document.getElementById('defValue').value) || 0;

  // 受けたダメージを計算
  let damage = maxHP - currentHP;
  
  // ダメージ情報の定義
  const damageInfo = `防:${defValue} ダ:${damage}`;
  
  // ダメージ0以下のエラー処理
  if (damage <= 0) {
    if (estimateResult) estimateResult.innerHTML = "ダメージが0以下です";
    if (highlightedResult) highlightedResult.style.display = 'none';
    return;
  }

  // 技情報の取得
  let originalMoveName = movesSelect.options[movesSelect.selectedIndex].textContent;
  let moveName = originalMoveName;
  let displayMoveName = originalMoveName;

  if (originalMoveName.includes('ダークラッシュ')) {
    moveName = `ダークラッシュ(${currentOrigin})`;
    displayMoveName = moveName;
  }

  // 技情報の検索
  let moveInfo = moveData.find(m => m.name === originalMoveName);
  if (!moveInfo && originalMoveName.includes('ダークラッシュ')) {
    moveInfo = moveData.find(m => m.name === moveName);
  }

  if (!moveInfo) {
    if (estimateResult) estimateResult.innerHTML = "技情報が見つかりません: " + moveName;
    if (highlightedResult) highlightedResult.style.display = 'none';
    return;
  }

  // 技のパラメータ取得
  let power = moveInfo.power || 0;
  const category = moveInfo.category || "";
  const moveType = moveInfo.type || "";
  const moveClass = moveInfo.class || "standard";
  const categoryJP = category === "Physical" ? "物理" : "特殊";
  const isPhysical = category === "Physical";

  // レベル情報
  const level = parseInt(document.getElementById('defLevel').value) || 50;
  const attackerLevel = hasAddLevel ? level + currentAddLevel : level;
  const originalLevel = level; // レベル補正前のレベル

  // ポケモン情報の取得
  const pokemonInfo = allPokemonData.find(p => p.name === currentPokemonName);
  let attackerTypes = [];
  if (pokemonInfo && pokemonInfo.type) {
    attackerTypes = Array.isArray(pokemonInfo.type) ? pokemonInfo.type : [pokemonInfo.type];
  }

  // 防御側（自分側）のタイプ情報を取得
  let defenderTypes = [];
  if (currentMyPokemonName && currentMyPokemonTypes.length > 0) {
    defenderTypes = currentMyPokemonTypes;
  }

  // 使用する能力値のベース値を選択
  const baseStat = isPhysical ? baseStats.a : baseStats.c;

// 各種補正チェック
  // ヨガパワー
  const isYogaPower = document.getElementById('yogaPowerCheck') && 
                     document.getElementById('yogaPowerCheck').checked;
  
  // はりきり
  const isHarikiri = document.getElementById('harikiriCheck') && 
                    document.getElementById('harikiriCheck').checked;
  
  // しんりょく (くさタイプ)
  const isShinryoku = document.getElementById('shinryokuCheck') && 
                     document.getElementById('shinryokuCheck').checked;
  
  // もうか (ほのおタイプ)
  const isMouka = document.getElementById('moukaCheck') && 
                 document.getElementById('moukaCheck').checked;
  
  // げきりゅう (みずタイプ)
  const isGekiryuu = document.getElementById('gekiryuuCheck') && 
                    document.getElementById('gekiryuuCheck').checked;
  
  // むしのしらせ (むしタイプ)
  const isMushiNoShirase = document.getElementById('mushiNoShiraseCheck') && 
                          document.getElementById('mushiNoShiraseCheck').checked;
  
  // バッジ補正
  const badgeBoostCheck = document.getElementById('badgeBoostCheck') && 
                         document.getElementById('badgeBoostCheck').checked;
  
  // 壁効果
  const hasWall = document.getElementById('wallCheck') && 
                 document.getElementById('wallCheck').checked;
  
  // ダブルバトル
  const isDoubleBattle = document.getElementById('doubleCheck') && 
                        document.getElementById('doubleCheck').checked;
  
  // 火傷
  const isBurned = document.getElementById('burnCheck') && 
                  document.getElementById('burnCheck').checked;
  
  // 急所
  const isCritical = document.getElementById('Critical2Check') && 
                    document.getElementById('Critical2Check').checked;
  
  // 天候
  const weather = document.getElementById('weatherSelect') ? 
                 document.getElementById('weatherSelect').value : 'normal';
  
  // アイテム情報取得
  let itemModifier = 1.0;
  let itemPowerModifier = 1.0;
  
  if (currentItem) {
    // アイテムとタイプが一致するか
    if (currentItem.type && currentItem.type === moveType) {
      itemPowerModifier = 1.1;
    }
    
    // 直接ステータスに影響するアイテム
    if (currentItem.timing === "attackMod") {
      if (isPhysical && currentItem.a) {
        itemModifier = currentItem.a;
      } else if (!isPhysical && currentItem.c) {
        itemModifier = currentItem.c;
      }
    }
  }

  // 補正の計算（修正版）
  let totalModifier = 1.0;
  let typeMultiplier = 1.0; // タイプ相性は別管理
  
  // タイプ一致補正
  if (attackerTypes.includes(moveType)) {
    totalModifier *= 1.5;
    console.log("タイプ一致補正: ×1.5");
  }

  // 特性による技威力補正
  if ((isShinryoku && moveType === "くさ") ||
      (isMouka && moveType === "ほのお") ||
      (isGekiryuu && moveType === "みず") ||
      (isMushiNoShirase && moveType === "むし")) {
    totalModifier *= 1.5;
    console.log("特性補正(技威力): ×1.5");
  }

  // アイテムによる威力補正
  if (itemPowerModifier > 1.0) {
    totalModifier *= itemPowerModifier;
    console.log(`アイテム威力補正: ×${itemPowerModifier}`);
  }

  // ダブルバトル半減
  if (isDoubleReduced) {
    totalModifier *= 0.5;
    console.log("ダブルバトル半減: ×0.5");
  }

  // 壁効果     
  if (hasWall) {
    const wallFactor = isDoubleBattle ? 0.67 : 0.5;
    totalModifier *= wallFactor;
    console.log(`壁効果: ×${wallFactor}`);
  }

  // 火傷
  if (isBurned && isPhysical) {
    totalModifier *= 0.5;
    console.log("火傷補正: ×0.5");
  }

  // 天候効果
  if ((weather === 'sunny' && moveType === 'ほのお') ||
      (weather === 'rain' && moveType === 'みず') ||
      (weather === 'darkness' && moveType === 'ダーク')) {
    totalModifier *= 1.5;
    console.log(`天候補正: ×1.5`);
  } else if ((weather === 'sunny' && moveType === 'みず') ||
            (weather === 'rain' && moveType === 'ほのお')) {
    totalModifier *= 0.5;
    console.log(`天候補正: ×0.5`);
  }

  // 急所
  if (isCritical) {
    totalModifier *= 2.0;
    console.log("急所補正: ×2.0");
  }

  // タイプ相性 - 別管理に修正
  if (moveType === "ダーク") {
    if (isDarkPokemon) {
      typeMultiplier *= 0.5;
      console.log(`ダークポケモン補正: ×0.5`);
    } else {
      typeMultiplier *= 2.0;
      console.log(`ダーク技抜群補正: ×2.0`);
    }
    
    // くらやみ状態の場合の追加補正
    if (isDarknessActive) {
      typeMultiplier *= 1.5;
      console.log(`くらやみ補正: ×1.5`);
    }
  } 
  // 通常のタイプ相性
  else if (defenderTypes.length > 0) {
    let typeEffect = defenderTypes.reduce((eff, defType) => {
      if (typeMultiplierData[moveType] && typeMultiplierData[moveType][defType]) {
        return eff * typeMultiplierData[moveType][defType];
      }
      return eff;
    }, 1.0);
    
    typeMultiplier *= typeEffect;
    console.log(`タイプ相性: ×${typeEffect}`);
  }

  // きしかいせい・じたばた
  if(moveClass === "pinch_up"){
    const maxHP = document.getElementById('pinchUp2_maxHP').value;
    const currentHP = document.getElementById('pinchUp2_currentHP').value;
    const HPrate = Math.floor(currentHP * 48 / maxHP);
    if(HPrate >= 33){
      power = 20;
    }
    else if(HPrate >= 17){
      power = 40;
    }
    else if(HPrate >= 10){
      power = 80;
    }
    else if(HPrate >= 5){
      power = 100;
    }
    else if(HPrate >= 2){
      power = 150;
    }
    else if(HPrate >= 0){
      power = 200;
    }
  }

  // トリプルキック
  if(moveClass === "triple_kick") {
    const selectedKick = document.querySelector('input[name="triple_kick"]:checked');
    power = parseInt(selectedKick.value);
  }
  // 各補正の詳細を表示
  let debugModifiers = [];
  if (attackerTypes.includes(moveType)) debugModifiers.push('タイプ一致×1.5');
  if (isCritical) debugModifiers.push('急所×2.0');
  if (moveType === "ダーク" && isDarkPokemon) debugModifiers.push('ダークポケモン×0.5');
  if (moveType === "ダーク" && !isDarkPokemon) debugModifiers.push('ダーク技抜群×2.0');
  if (isDarknessActive) debugModifiers.push('くらやみ×1.5');
  if (isDoubleReduced) debugModifiers.push('ダブル半減×0.5');


  // 理論上の最小・最大ダメージを計算
  const theoreticalMinAttack = calculateTheoreticalStat(baseStat, 0, attackerLevel, 0.9);
  const theoreticalMaxAttack = calculateTheoreticalStat(baseStat, 31, attackerLevel, 1.1);

  console.log(`理論上の実数値範囲: ${theoreticalMinAttack}～${theoreticalMaxAttack}`);

  // 補正を考慮してダメージを逆算用に調整
  // タイプ相性とその他の補正を両方適用
  const adjustedDamage = Math.round(damage / (totalModifier * typeMultiplier));

  // 実数値範囲を求める（補正除去後のダメージで計算）
  const statRange = findStatByDamage(
    adjustedDamage, defValue, attackerLevel, power, category, moveType,
    attackerTypes, defenderTypes, isDarkPokemon, atkRank, defRank
  );

  let minBaseStat = statRange.min;
  let maxBaseStat = statRange.max;

  // ステータス直接補正の計算
  let statModifier = 1.0;

  // ヨガパワー補正
  if (isYogaPower && isPhysical) {
    statModifier *= 2.0;
  }

  // はりきり補正
  if (isHarikiri && isPhysical) {
    statModifier *= 1.5;
  }

  // アイテム補正
  statModifier *= itemModifier;

  // ステータス直接補正がある場合は、補正前の値に戻す
  if (statModifier > 1.0) {
    // 補正後の実数値から補正前の実数値を逆算
    minBaseStat = Math.ceil(minBaseStat / statModifier);
    maxBaseStat = Math.floor(maxBaseStat / statModifier);
    
    console.log(`ステータス補正(×${statModifier})を考慮した補正前実数値範囲: ${minBaseStat}～${maxBaseStat}`);
  }
  else {
    // 範囲の検証
    console.log(`探索による実数値範囲: ${minBaseStat}～${maxBaseStat}`);
  }

  // 実数値の理論上の最小値を計算（個体値0＋性格補正0.9倍）
  const minIV = 0;
  const minNatureBoost = 0.9;
  const theoreticalMinBase = Math.floor((baseStat * 2 + minIV) * attackerLevel / 100 + 5);
  const theoreticalMinStat = Math.floor(theoreticalMinBase * minNatureBoost);

  // 実数値の理論上の最大値を計算（個体値31＋性格補正1.1倍）
  const maxIV = 31;
  const maxNatureBoost = 1.1;
  const theoreticalMaxBase = Math.floor((baseStat * 2 + maxIV) * attackerLevel / 100 + 5);
  const theoreticalMaxStat = Math.floor(theoreticalMaxBase * maxNatureBoost);

  if (minBaseStat < theoreticalMinStat) {
    console.log(`最小実数値が理論上の最小値を下回るため、${theoreticalMinStat}に制限します`);
    minBaseStat = theoreticalMinStat;
  }

  if (maxBaseStat > theoreticalMaxStat) {
    console.log(`最大実数値が理論上の最大値を超えているため、${theoreticalMaxStat}に制限します`);
    maxBaseStat = theoreticalMaxStat;
  }

  // 補正込みの実数値範囲
  minStat = minBaseStat;
  maxStat = maxBaseStat;

  console.log(`実数値範囲: ${minStat}～${maxStat}`);
  // 個体値マッピングの作成
  const exactIVsForStats = {};
  
  // 各実数値に対応する個体値を計算
  for (let statValue = minStat; statValue <= maxStat; statValue++) {
    exactIVsForStats[statValue] = {
      neutral: [], // 無補正で対象値になる個体値
      up: [],      // 上昇補正で対象値になる個体値
      down: []     // 下降補正で対象値になる個体値
    };
    
    for (let iv = 0; iv <= 31; iv++) {
      // 無補正(1.0)
      const neutralStat = Math.floor((baseStat * 2 + iv) * attackerLevel / 100 + 5);
      if (neutralStat === statValue) {
        exactIVsForStats[statValue].neutral.push(iv);
      }
      
      // 上昇補正(1.1)
      const upStat = Math.floor(Math.floor((baseStat * 2 + iv) * attackerLevel / 100 + 5) * 1.1);
      if (upStat === statValue) {
        exactIVsForStats[statValue].up.push(iv);
      }
      
      // 下降補正(0.9)
      const downStat = Math.floor(Math.floor((baseStat * 2 + iv) * attackerLevel / 100 + 5) * 0.9);
      if (downStat === statValue) {
        exactIVsForStats[statValue].down.push(iv);
      }
    }
  }
  
  // 個体値表示文字列の生成
  let minIVText = ""; 
  let maxIVText = "";
  
  // 最小実数値に対応する個体値表示を生成
  const minStatOptions = exactIVsForStats[minStat];
  if (minStatOptions) {
    // 最も優先順位の高い個体値を選択（無補正 > 下降補正 > 上昇補正）
    if (minStatOptions.neutral && minStatOptions.neutral.length > 0) {
      minIVText = `${minStatOptions.neutral[0]}`;
    } else if (minStatOptions.down && minStatOptions.down.length > 0) {
      minIVText = `${minStatOptions.down[0]}↓`;
    } else if (minStatOptions.up && minStatOptions.up.length > 0) {
      minIVText = `${minStatOptions.up[0]}↑`;
    } else {
      minIVText = "－";
    }
  } else {
    minIVText = "－";
  }

  // 最大実数値に対応する個体値表示の生成
  const maxStatOptions = exactIVsForStats[maxStat];
  if (maxStatOptions) {
    // 最も優先順位の高い個体値を選択（無補正31 > 補正付き31 > その他の最大値）
    if (maxStatOptions.neutral && maxStatOptions.neutral.includes(31)) {
      maxIVText = "31";
    } else if (maxStatOptions.down && maxStatOptions.down.includes(31)) {
      maxIVText = "31↓";
    } else if (maxStatOptions.up && maxStatOptions.up.includes(31)) {
      maxIVText = "31↑";
    } else {
      // 最大の個体値を検索
      let maxIV = -1;
      let maxNature = "";
      
      if (maxStatOptions.neutral && maxStatOptions.neutral.length > 0) {
        maxIV = Math.max(...maxStatOptions.neutral);
        maxNature = "";
      }
      
      if (maxStatOptions.up && maxStatOptions.up.length > 0) {
        const upMaxIV = Math.max(...maxStatOptions.up);
        if (upMaxIV > maxIV) {
          maxIV = upMaxIV;
          maxNature = "↑";
        }
      }
      
      if (maxStatOptions.down && maxStatOptions.down.length > 0) {
        const downMaxIV = Math.max(...maxStatOptions.down);
        if (downMaxIV > maxIV) {
          maxIV = downMaxIV;
          maxNature = "↓";
        }
      }
      
      maxIVText = maxIV >= 0 ? `${maxIV}${maxNature}` : "－";
    }
  } else {
    maxIVText = "－";
  }

  // 個体値31があるかどうかを確認する関数
  function hasIV31InRange(minStat, maxStat) {
    // 範囲内の各値について31の個体値があるかチェック
    for (let statValue = minStat; statValue <= maxStat; statValue++) {
      if (!exactIVsForStats[statValue]) continue;
      
      const options = exactIVsForStats[statValue];
      if ((options.neutral && options.neutral.includes(31)) ||
          (options.up && options.up.includes(31)) ||
          (options.down && options.down.includes(31))) {
        return true;
      }
    }
    return false;
  }

  // 個体値表記を計算する関数
  function calculateIVDisplay(minStat, maxStat) {
    // 最小実数値に対応する個体値表示を生成
    let minIVText = "";
    const minStatOptions = exactIVsForStats[minStat];
    
    // 最大実数値に対応する個体値表示の生成
    let maxIVText = "";
    const maxStatOptions = exactIVsForStats[maxStat];
    
    // 実数値が同じ場合の特別処理（minStat === maxStat）
    if (minStat === maxStat) {
      const sameStatOptions = exactIVsForStats[minStat];
      if (sameStatOptions) {
        // 各補正タイプごとに取り得るすべての個体値を取得
        const allNeutralIVs = sameStatOptions.neutral || [];
        const allUpIVs = sameStatOptions.up || [];
        const allDownIVs = sameStatOptions.down || [];
        
        // 各補正タイプの最小と最大の個体値を取得
        let minIV = Infinity;
        let maxIV = -Infinity;
        let minNature = "";
        let maxNature = "";
        
        // 無補正の場合
        if (allNeutralIVs.length > 0) {
          const min = Math.min(...allNeutralIVs);
          const max = Math.max(...allNeutralIVs);
          if (min < minIV) {
            minIV = min;
            minNature = "";
          }
          if (max > maxIV) {
            maxIV = max;
            maxNature = "";
          }
        }
        
        // 上昇補正の場合
        if (allUpIVs.length > 0) {
          const min = Math.min(...allUpIVs);
          const max = Math.max(...allUpIVs);
          if (min < minIV) {
            minIV = min;
            minNature = "↑";
          }
          if (max > maxIV) {
            maxIV = max;
            maxNature = "↑";
          }
        }
        
        // 下降補正の場合
        if (allDownIVs.length > 0) {
          const min = Math.min(...allDownIVs);
          const max = Math.max(...allDownIVs);
          if (min < minIV) {
            minIV = min;
            minNature = "↓";
          }
          if (max > maxIV) {
            maxIV = max;
            maxNature = "↓";
          }
        }
        
        // 最小と最大の個体値が両方とも有効な値なら範囲表示
        if (minIV !== Infinity && maxIV !== -Infinity) {
          // 最小と最大が同じ場合は単一表示
          if (minIV === maxIV && minNature === maxNature) {
            return `${minIV}${minNature}`;
          }
          
          // 最小と最大の個体値・補正が異なる場合は範囲表示
          return `${minIV}${minNature}～${maxIV}${maxNature}`;
        }
      }
    }
    
    // 以下、既存のコード（範囲表示の場合）
    if (minStatOptions) {
      // 最も優先順位の高い個体値を選択（無補正 > 下降補正 > 上昇補正）
      if (minStatOptions.neutral && minStatOptions.neutral.length > 0) {
        minIVText = `${minStatOptions.neutral[0]}`;
      } else if (minStatOptions.down && minStatOptions.down.length > 0) {
        minIVText = `${minStatOptions.down[0]}↓`;
      } else if (minStatOptions.up && minStatOptions.up.length > 0) {
        minIVText = `${minStatOptions.up[0]}↑`;
      } else {
        minIVText = "－";
      }
    } else {
      minIVText = "－";
    }
    
    if (maxStatOptions) {
      // 最も優先順位の高い個体値を選択
      if (maxStatOptions.neutral && maxStatOptions.neutral.includes(31)) {
        maxIVText = "31";
      } else if (maxStatOptions.down && maxStatOptions.down.includes(31)) {
        maxIVText = "(31↓)";
      } else if (maxStatOptions.up && maxStatOptions.up.includes(31)) {
        maxIVText = "31↑";
      } else {
        // 最大の個体値を検索
        let maxIV = -1;
        let maxNature = "";
       
        if (maxStatOptions.neutral && maxStatOptions.neutral.length > 0) {
          maxIV = Math.max(...maxStatOptions.neutral);
          maxNature = "";
        }
       
        if (maxStatOptions.up && maxStatOptions.up.length > 0) {
          const upMaxIV = Math.max(...maxStatOptions.up);
          if (upMaxIV > maxIV) {
            maxIV = upMaxIV;
            maxNature = "↑";
          }
        }
       
        if (maxStatOptions.down && maxStatOptions.down.length > 0) {
          const downMaxIV = Math.max(...maxStatOptions.down);
          if (downMaxIV > maxIV) {
            maxIV = downMaxIV;
            maxNature = "↓";
          }
        }
       
        maxIVText = maxIV >= 0 ? `${maxIV}${maxNature}` : "－";
      }
    } else {
      maxIVText = "－";
    }
   
    // 個体値31があるかどうかを確認する
    const iv31Info = findStatWithIV31(minStat, maxStat);
   
    let ivRangeDisplay = "";
   
    if (minIVText === "－" && maxIVText === "－") {
      // 両方が不明の場合
      ivRangeDisplay = "－";
    } else if (minStat === maxStat) {
      // 単一値の場合
      ivRangeDisplay = minIVText;
    } else if (iv31Info) {
      // 31が見つかった場合
      const { stat: iv31Stat, nature: iv31Nature } = iv31Info;
     
      // 31が範囲の最小値か最大値でなければ中間に表示
      if (minStat < iv31Stat && iv31Stat < maxStat) {
        // 常に括弧付きで表示
        ivRangeDisplay = `${minIVText}～(31${iv31Nature})～${maxIVText}`;
      } else if (iv31Stat === maxStat) {
        // 31が最大値の場合
        if (iv31Nature === "") {
          ivRangeDisplay = `${minIVText}～31`;
        } else {
          ivRangeDisplay = `${minIVText}～31${iv31Nature}`;
        }
      } else if (iv31Stat === minStat) {
        // 31が最小値の場合
        if (iv31Nature === "") {
          ivRangeDisplay = `31～${maxIVText}`;
        } else {
          ivRangeDisplay = `31${iv31Nature}～${maxIVText}`;
        }
      } else {
        // その他の場合は通常の範囲表示
        ivRangeDisplay = `${minIVText}～${maxIVText}`;
      }
    } else {
      // 31がない通常の範囲表示
      ivRangeDisplay = `${minIVText}～${maxIVText}`;
    }
   
    return ivRangeDisplay;
  }
// 個体値31が実数値のどこにあるかを見つける関数
function findStatWithIV31(minStat, maxStat) {
  // 範囲内の各実数値について個体値31があるかをチェック
  let neutralIV31Stat = null;  // 無補正31の実数値
  let upIV31Stat = null;      // 上昇補正31の実数値
  let downIV31Stat = null;    // 下降補正31の実数値
  
  for (let statValue = minStat; statValue <= maxStat; statValue++) {
    if (!exactIVsForStats[statValue]) continue;
    
    const options = exactIVsForStats[statValue];
    
    // 無補正31の検索
    if (options.neutral && options.neutral.includes(31)) {
      neutralIV31Stat = statValue;
    }
    
    // 下降補正31の検索
    if (options.down && options.down.includes(31)) {
      downIV31Stat = statValue;
    }
    
    // 上昇補正31の検索
    if (options.up && options.up.includes(31)) {
      upIV31Stat = statValue;
    }
  }
  
  // 無補正31を優先的に返す
  if (neutralIV31Stat !== null) {
    return { stat: neutralIV31Stat, nature: "" };
  }
  // 次に下降補正31
  if (downIV31Stat !== null) {
    return { stat: downIV31Stat, nature: "↓" };
  }
  // 最後に上昇補正31
  if (upIV31Stat !== null) {
    return { stat: upIV31Stat, nature: "↑" };
  }
  
  return null; // 31が見つからない場合
}

// IVテキスト範囲の表示形式を修正
let ivRangeDisplay = "";

// 範囲内の31を検索
const iv31Info = findStatWithIV31(minStat, maxStat);

if (minIVText === "－" && maxIVText === "－") {
  // 両方が不明の場合
  ivRangeDisplay = "－";
} else if (minStat === maxStat) {
  // ここを修正: 単一の実数値でも個体値の範囲を表示する
  if (minStatOptions) {
    // 全ての個体値を集める処理
    let allIVs = [];
    let allNatures = [];
    
    // 無補正
    if (minStatOptions.neutral && minStatOptions.neutral.length > 0) {
      minStatOptions.neutral.forEach(iv => {
        allIVs.push(iv);
        allNatures.push("");
      });
    }
    
    // 上昇補正
    if (minStatOptions.up && minStatOptions.up.length > 0) {
      minStatOptions.up.forEach(iv => {
        allIVs.push(iv);
        allNatures.push("↑");
      });
    }
    
    // 下降補正
    if (minStatOptions.down && minStatOptions.down.length > 0) {
      minStatOptions.down.forEach(iv => {
        allIVs.push(iv);
        allNatures.push("↓");
      });
    }
    
    // 個体値とその性格補正のペアを作成
    const ivNaturePairs = allIVs.map((iv, index) => ({
      iv: iv,
      nature: allNatures[index]
    }));
    
    // 個体値の昇順にソート
    ivNaturePairs.sort((a, b) => {
      // 個体値が同じ場合は性格で並べ替え (無補正 > 上昇補正 > 下降補正)
      if (a.iv === b.iv) {
        const natureOrder = {"": 0, "↑": 1, "↓": 2};
        return natureOrder[a.nature] - natureOrder[b.nature];
      }
      return a.iv - b.iv;
    });
    
    // 最小と最大の個体値を取得
    if (ivNaturePairs.length > 0) {
      const minIV = ivNaturePairs[0];
      const maxIV = ivNaturePairs[ivNaturePairs.length - 1];
      
      // 最小と最大が同じ場合
      if (minIV.iv === maxIV.iv && minIV.nature === maxIV.nature) {
        ivRangeDisplay = `${minIV.iv}${minIV.nature}`;
      } else {
        // 異なる場合は範囲表示
        ivRangeDisplay = `${minIV.iv}${minIV.nature}～${maxIV.iv}${maxIV.nature}`;
      }
    } else {
      // 個体値が見つからない場合は既存の処理に戻る
      ivRangeDisplay = minIVText;
    }
  } else {
    // 情報不足の場合は既存の処理に戻る
    ivRangeDisplay = minIVText;
  }
} else if (iv31Info) {
  // 31が見つかった場合
  const { stat: iv31Stat, nature: iv31Nature } = iv31Info;
  
  // 31が範囲の最小値か最大値でなければ中間に表示
  if (minStat < iv31Stat && iv31Stat < maxStat) {
    // 無補正31の場合は括弧付きで表示
    if (iv31Nature === "") {
      ivRangeDisplay = `${minIVText}～(31)～${maxIVText}`;
    } else {
      ivRangeDisplay = `${minIVText}～(31${iv31Nature})～${maxIVText}`;
    }
  } else if (iv31Stat === maxStat) {
    // 31が最大値の場合
    if (iv31Nature === "") {
      ivRangeDisplay = `${minIVText}～(31)`;
    } else {
      ivRangeDisplay = `${minIVText}～31${iv31Nature}`;
    }
  } else if (iv31Stat === minStat) {
    // 31が最小値の場合
    if (iv31Nature === "") {
      ivRangeDisplay = `(31)～${maxIVText}`;
    } else {
      ivRangeDisplay = `31${iv31Nature}～${maxIVText}`;
    }
  } else {
    // その他の場合は通常の範囲表示
    ivRangeDisplay = `${minIVText}～${maxIVText}`;
  }
} else {
  // 31がない通常の範囲表示
  ivRangeDisplay = `${minIVText}～${maxIVText}`;
}
// estimateIVFromDamage関数の結果表示部分を修正

  // 表示用データ
  const statTypeLabel = isPhysical ? "A" : "C";
  const ivTypeLabel = isPhysical ? "A個体値" : "C個体値";
  
  // レベル補正なしの実数値を計算（レベル補正がある場合のみ）
  let displayStatRange = `${statTypeLabel}:${minStat}～${maxStat}`;
  
  if (hasAddLevel && currentAddLevel > 0) {
    // レベル補正なしの実数値を計算
    let minStatWithoutBoost = minStat;
    let maxStatWithoutBoost = maxStat;
    
    // exactIVsForStatsから個体値を取得して、元のレベルで再計算
    if (exactIVsForStats[minStat]) {
      // 最小実数値に対応する個体値と性格補正を取得
      let minIV = null;
      let minNatureMod = 1.0;
      
      if (exactIVsForStats[minStat].neutral.length > 0) {
        minIV = exactIVsForStats[minStat].neutral[0];
        minNatureMod = 1.0;
      } else if (exactIVsForStats[minStat].down.length > 0) {
        minIV = exactIVsForStats[minStat].down[0];
        minNatureMod = 0.9;
      } else if (exactIVsForStats[minStat].up.length > 0) {
        minIV = exactIVsForStats[minStat].up[0];
        minNatureMod = 1.1;
      }
      
      if (minIV !== null) {
        // 元のレベル（補正なし）で実数値を再計算
        const baseCalc = Math.floor((baseStat * 2 + minIV) * originalLevel / 100 + 5);
        minStatWithoutBoost = Math.floor(baseCalc * minNatureMod);
      }
    }
    
    if (exactIVsForStats[maxStat]) {
      // 最大実数値に対応する個体値と性格補正を取得
      let maxIV = null;
      let maxNatureMod = 1.0;
      
      if (exactIVsForStats[maxStat].neutral.length > 0) {
        maxIV = Math.max(...exactIVsForStats[maxStat].neutral);
        maxNatureMod = 1.0;
      }
      if (exactIVsForStats[maxStat].up.length > 0) {
        const upMax = Math.max(...exactIVsForStats[maxStat].up);
        if (maxIV === null || upMax > maxIV || (upMax === 31)) {
          maxIV = upMax;
          maxNatureMod = 1.1;
        }
      }
      if (exactIVsForStats[maxStat].down.length > 0) {
        const downMax = Math.max(...exactIVsForStats[maxStat].down);
        if (maxIV === null || (downMax === 31 && maxNatureMod !== 1.1)) {
          maxIV = downMax;
          maxNatureMod = 0.9;
        }
      }
      
      if (maxIV !== null) {
        // 元のレベル（補正なし）で実数値を再計算
        const baseCalc = Math.floor((baseStat * 2 + maxIV) * originalLevel / 100 + 5);
        maxStatWithoutBoost = Math.floor(baseCalc * maxNatureMod);
      }
    }
    
    // レベル補正ありの場合の表示形式
    displayStatRange = `${statTypeLabel}:${minStatWithoutBoost}～${maxStatWithoutBoost}<br><span style="font-size: 0.9em; color: #888; font-weight: normal;">(Lv補正時:${minStat}～${maxStat})</span>`;
  }

// 技威力取得
let movePowerText = `:威力${power}`;
if(document.querySelector('.pinchUp2Container').style.display === 'flex'){
  // きしかいせい・じたばた
  if(moveClass === "pinch_up"){
    const maxHP = document.getElementById('pinchUp2_maxHP').value;
    const currentHP = document.getElementById('pinchUp2_currentHP').value;
    const HPrate = Math.floor(currentHP * 48 / maxHP);
    if(HPrate >= 33){
      power = 20;
    }
    else if(HPrate >= 17){
      power = 40;
    }
    else if(HPrate >= 10){
      power = 80;
    }
    else if(HPrate >= 5){
      power = 100;
    }
    else if(HPrate >= 2){
      power = 150;
    }
    else if(HPrate >= 0){
      power = 200;
    }
    movePowerText = `:威力${power}`;
  }
}
const displayMoveNameWithPower = `(${displayMoveName}${movePowerText}/${categoryJP})`;

// 補正情報テキストのスタイルを小さく薄く
let boosterText = "";

// 補正情報を小さく薄いスタイルで表示
const boosterStyle = `style="font-size: 0.85em; color: #888; font-weight: normal;"`;

// 特性補正
if (isShinryoku && moveType === "くさ") {
  boosterText += `<br><span ${boosterStyle}>[しんりょく: 威力×1.5]</span>`;
}
if (isMouka && moveType === "ほのお") {
  boosterText += `<br><span ${boosterStyle}>[もうか: 威力×1.5]</span>`;
}
if (isGekiryuu && moveType === "みず") {
  boosterText += `<br><span ${boosterStyle}>[げきりゅう: 威力×1.5]</span>`;
}
if (isMushiNoShirase && moveType === "むし") {
  boosterText += `<br><span ${boosterStyle}>[むしのしらせ: 威力×1.5]</span>`;
}

// アイテム補正
if (currentItem) {
  if (currentItem.type && currentItem.type === moveType) {
    boosterText += `<br><span ${boosterStyle}>[${currentItem.name}: ${isPhysical ? "A" : "C"}×${itemModifier.toFixed(1)}]</span>`;
  }
}

// ステータス直接補正
if (isYogaPower && isPhysical) {
  boosterText += `<br><span ${boosterStyle}>[ヨガパワー: ${isPhysical ? "A" : "C"}×2.0]</span>`;
}
if (isHarikiri && isPhysical) {
  boosterText += `<br><span ${boosterStyle}>[はりきり: ${isPhysical ? "A" : "C"}×1.5]</span>`;
}

// フィールド効果
if (isDoubleReduced) {
  boosterText += `<br><span ${boosterStyle}>[ダブルバトル: ×0.5]</span>`;
}
if (hasWall) {
  const wallMod = isDoubleBattle ? 0.67 : 0.5;
  boosterText += `<br><span ${boosterStyle}>[壁効果: ×${wallMod.toFixed(2)}]</span>`;
}
if (isBurned && isPhysical) {
  boosterText += `<br><span ${boosterStyle}>[火傷: ×0.5]</span>`;
}
if (isCritical) {
  boosterText += `<br><span ${boosterStyle}>[急所: ×2.0]</span>`;
}

// 天候効果
if (weather === 'sunny' && moveType === 'ほのお') {
  boosterText += `<br><span ${boosterStyle}>[晴れ: ほのお技×1.5]</span>`;
} else if (weather === 'sunny' && moveType === 'みず') {
  boosterText += `<br><span ${boosterStyle}>[晴れ: みず技×0.5]</span>`;
} else if (weather === 'rain' && moveType === 'みず') {
  boosterText += `<br><span ${boosterStyle}>[雨: みず技×1.5]</span>`;
} else if (weather === 'rain' && moveType === 'ほのお') {
  boosterText += `<br><span ${boosterStyle}>[雨: ほのお技×0.5]</span>`;
} else if (weather === 'darkness' && moveType === 'ダーク') {
  boosterText += `<br><span ${boosterStyle}>[暗闇: ダーク技×1.5]</span>`;
}

// タイプ一致
if (attackerTypes.includes(moveType)) {
  boosterText += `<br><span ${boosterStyle}>[タイプ一致: ×1.5]</span>`;
}

// タイプ相性（特殊ケース）
if (moveType === "ダーク" && isDarkPokemon) {
  boosterText += `<br><span ${boosterStyle}>[ダークポケモン: ×0.5]</span>`;
} else if (moveType === "ダーク" && isDarknessActive) {
  boosterText += `<br><span ${boosterStyle}>[暗闇状態: ×1.5]</span>`;
} else if (defenderTypes.length > 0) {
  // 通常のタイプ相性
  const typeEff = defenderTypes.reduce((eff, defType) => {
    if (typeMultiplierData[moveType] && typeMultiplierData[moveType][defType]) {
      return eff * typeMultiplierData[moveType][defType];
    }
    return eff;
  }, 1.0);
  
  if (typeEff !== 1.0) {
    boosterText += `<br><span ${boosterStyle}>[タイプ相性: ダメージ×${typeEff.toFixed(1)}]</span>`;
  }
}

// HTML表示用のテキスト
  // HTML表示用のテキスト（displayStatRangeを使用）
  const resultText = 
    `${damageInfo} ` +
    `${displayStatRange}<br>` +  // ここを変更
    `${ivTypeLabel}:${ivRangeDisplay}<br>` +
    `${currentPokemonName}Lv${originalLevel}<br>` +
    `${displayMoveNameWithPower}` +
    `${boosterText}`;
  
  // 絞り込み結果の適用と表示更新
  let cumulativeResultText = "";
  
  if (isTrackingEnabled) {
    // 現在の範囲値を取得
    const currentRangeMin = isPhysical ? physicalRangeMin : specialRangeMin;
    const currentRangeMax = isPhysical ? physicalRangeMax : specialRangeMax;
    console.log(`保存されている範囲: ${currentRangeMin}～${currentRangeMax}`);
    
    // 初回かどうかを判定（両方0の場合は初回）
    const isFirstCalculation = currentRangeMin === 0 && currentRangeMax === 999;
    
    let updatedRangeMin, updatedRangeMax;
    
    if (isFirstCalculation) {
      // 初回の場合は現在の計算値をそのまま使用
      updatedRangeMin = minStat;
      updatedRangeMax = maxStat;
      
      // グローバル変数に保存
      if (isPhysical) {
        physicalRangeMin = updatedRangeMin;
        physicalRangeMax = updatedRangeMax;
      } else {
        specialRangeMin = updatedRangeMin;
        specialRangeMax = updatedRangeMax;
      }
    } else {
      // 2回目以降は交差範囲を計算
      updatedRangeMin = Math.max(currentRangeMin, minStat);
      updatedRangeMax = Math.min(currentRangeMax, maxStat);
      
      // グローバル変数に保存
      if (isPhysical) {
        physicalRangeMin = updatedRangeMin;
        physicalRangeMax = updatedRangeMax;
      } else {
        specialRangeMin = updatedRangeMin;
        specialRangeMax = updatedRangeMax;
      }
    }
    
    // 下位互換性のための変数も更新
    cumulativeMinAtk = updatedRangeMin;
    cumulativeMaxAtk = updatedRangeMax;
    
    // 絞り込まれた範囲に対応する個体値表記を計算
    const filteredIVsDisplay = calculateIVDisplay(updatedRangeMin, updatedRangeMax);
    
    // 絞り込み結果でもレベル補正を考慮した表示
    let filteredDisplayStatRange = `${statTypeLabel}:${updatedRangeMin}～${updatedRangeMax}`;
    
    if (hasAddLevel && currentAddLevel > 0) {
      // 絞り込み後の実数値からレベル補正なしの値を推定
      // exactIVsForStatsを使って正確に計算
      let filteredMinWithoutBoost = updatedRangeMin;
      let filteredMaxWithoutBoost = updatedRangeMax;
      
      // 最小値の処理
      if (exactIVsForStats[updatedRangeMin]) {
        let minIV = null;
        let minNatureMod = 1.0;
        
        if (exactIVsForStats[updatedRangeMin].neutral.length > 0) {
          minIV = exactIVsForStats[updatedRangeMin].neutral[0];
          minNatureMod = 1.0;
        } else if (exactIVsForStats[updatedRangeMin].down.length > 0) {
          minIV = exactIVsForStats[updatedRangeMin].down[0];
          minNatureMod = 0.9;
        } else if (exactIVsForStats[updatedRangeMin].up.length > 0) {
          minIV = exactIVsForStats[updatedRangeMin].up[0];
          minNatureMod = 1.1;
        }
        
        if (minIV !== null) {
          const baseCalc = Math.floor((baseStat * 2 + minIV) * originalLevel / 100 + 5);
          filteredMinWithoutBoost = Math.floor(baseCalc * minNatureMod);
        }
      }
      
      // 最大値の処理
      if (exactIVsForStats[updatedRangeMax]) {
        let maxIV = null;
        let maxNatureMod = 1.0;
        
        if (exactIVsForStats[updatedRangeMax].neutral.length > 0) {
          maxIV = Math.max(...exactIVsForStats[updatedRangeMax].neutral);
          maxNatureMod = 1.0;
        }
        if (exactIVsForStats[updatedRangeMax].up.length > 0) {
          const upMax = Math.max(...exactIVsForStats[updatedRangeMax].up);
          if (maxIV === null || upMax > maxIV || (upMax === 31)) {
            maxIV = upMax;
            maxNatureMod = 1.1;
          }
        }
        if (exactIVsForStats[updatedRangeMax].down.length > 0) {
          const downMax = Math.max(...exactIVsForStats[updatedRangeMax].down);
          if (maxIV === null || (downMax === 31 && maxNatureMod !== 1.1)) {
            maxIV = downMax;
            maxNatureMod = 0.9;
          }
        }
        
        if (maxIV !== null) {
          const baseCalc = Math.floor((baseStat * 2 + maxIV) * originalLevel / 100 + 5);
          filteredMaxWithoutBoost = Math.floor(baseCalc * maxNatureMod);
        }
      }
      
      filteredDisplayStatRange = `${statTypeLabel}:${filteredMinWithoutBoost}～${filteredMaxWithoutBoost}<br><span style="font-size: 0.9em; color: #888; font-weight: normal;">(Lv補正時:${updatedRangeMin}～${updatedRangeMax})</span>`;
    }
    
    // 絞り込み結果用の表示文字列を更新
    cumulativeResultText = 
      `${damageInfo} ` +
      `${filteredDisplayStatRange}<br>` +
      `${ivTypeLabel}:${filteredIVsDisplay}<br>` +
      `${currentPokemonName}Lv${originalLevel}<br>` +
      `${displayMoveNameWithPower}` +
      `${boosterText}`;
    
    // 絞り込み結果があれば表示
    manageResultBlocks(isPhysical, cumulativeResultText);
  } else {
    // 通常の結果を表示
    manageResultBlocks(isPhysical, resultText);
  }

// 通常の結果表示も更新
if (estimateResult) {
estimateResult.innerHTML = resultText;
estimateResult.style.display = 'none'; // 非表示に
}
}

// ステータス値から個体値を計算するヘルパー関数
function calculateIVForStat(statValue, baseStat, level, natureModifiers) {
// 各可能性（無補正、上昇補正、下降補正）をチェック
let result = "";

// 無補正で該当する個体値を探す
for (let iv = 0; iv <= 31; iv++) {
const neutralStat = Math.floor((baseStat * 2 + iv) * level / 100 + 5);
if (neutralStat === statValue) {
result = `${iv}`;
break;
}
}

// 無補正で見つからなかった場合、上昇補正をチェック
if (!result) {
for (let iv = 0; iv <= 31; iv++) {
const upStat = Math.floor(Math.floor((baseStat * 2 + iv) * level / 100 + 5) * 1.1);
if (upStat === statValue) {
  result = `${iv}↑`;
  break;
}
}
}

// それでも見つからなかった場合、下降補正をチェック
if (!result) {
for (let iv = 0; iv <= 31; iv++) {
const downStat = Math.floor(Math.floor((baseStat * 2 + iv) * level / 100 + 5) * 0.9);
if (downStat === statValue) {
  result = `${iv}↓`;
  break;
}
}
}

return result || "－";
}

// ステータス値から個体値を計算するヘルパー関数
function calculateIVForStat(statValue, baseStat, level, natureModifiers) {
  // 各可能性（無補正、上昇補正、下降補正）をチェック
  let result = "";
  
  // 無補正で該当する個体値を探す
  for (let iv = 0; iv <= 31; iv++) {
    const neutralStat = Math.floor((baseStat * 2 + iv) * level / 100 + 5);
    if (neutralStat === statValue) {
      result = `${iv}`;
      break;
    }
  }
  
  // 無補正で見つからなかった場合、上昇補正をチェック
  if (!result) {
    for (let iv = 0; iv <= 31; iv++) {
      const upStat = Math.floor(Math.floor((baseStat * 2 + iv) * level / 100 + 5) * 1.1);
      if (upStat === statValue) {
        result = `${iv}↑`;
        break;
      }
    }
  }
  
  // それでも見つからなかった場合、下降補正をチェック
  if (!result) {
    for (let iv = 0; iv <= 31; iv++) {
      const downStat = Math.floor(Math.floor((baseStat * 2 + iv) * level / 100 + 5) * 0.9);
      if (downStat === statValue) {
        result = `${iv}↓`;
        break;
      }
    }
  }
  
  return result || "－";
}

  // グローバル変数へのアクセスを確保
let defPokemonDropdownInitialized = false;

// 初期化を試みるインターバル関数
function attemptDefPokemonInitialization() {
  // すでに初期化済みの場合は何もしない
  if (defPokemonDropdownInitialized) return;
    initializeDefPokemonDropdown();
    defPokemonDropdownInitialized = true;
    // 初期化成功したのでインターバルをクリア
    clearInterval(initializationInterval);
}

// 初期化インターバルを設定（500ms毎に確認）
const initializationInterval = setInterval(attemptDefPokemonInitialization, 500);

// 一定時間後に強制的に初期化を止める（10秒）
setTimeout(function() {
  if (!defPokemonDropdownInitialized) {
    console.error('allPokemonDataの読み込みタイムアウト - 初期化を中止します');
    clearInterval(initializationInterval);
  }
}, 10000);

// 被ダメ計算の自分ポケモンドロップダウンを初期化する関数
function initializeDefPokemonDropdown() {
  
  // 入力欄の取得
  const defPokemonInput = document.getElementById('searchDefPokemon');
  if (!defPokemonInput) {
    console.error('被ダメ計算の自分ポケモン入力欄が見つかりません');
    return;
  }
  
  // ドロップダウンの作成（既存のものがあれば削除）
  let defDropdown = document.getElementById('defPokemonDropdown');
  if (defDropdown) {
    defDropdown.parentNode.removeChild(defDropdown);
  }
  
  defDropdown = document.createElement('div');
  defDropdown.id = 'defPokemonDropdown';
  defDropdown.className = 'pokemon-dropdown';
  defDropdown.style.position = 'absolute';
  defDropdown.style.display = 'none';
  defDropdown.style.zIndex = '1000';
  defDropdown.style.backgroundColor = 'white';
  defDropdown.style.border = '1px solid #ccc';
  defDropdown.style.borderRadius = '4px';
  defDropdown.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  defDropdown.style.maxHeight = '200px';
  defDropdown.style.overflowY = 'auto';
  defDropdown.style.width = '200px';
  
  // ドロップダウンをDOMに追加
  document.body.appendChild(defDropdown);
  
  // クリックイベント
  defPokemonInput.addEventListener('click', function(e) {
    e.stopPropagation();
    
    // 内容のクリア
    defDropdown.innerHTML = '';
    
    // 位置の設定
    const rect = this.getBoundingClientRect();
    defDropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    defDropdown.style.left = (rect.left + window.scrollX) + 'px';
    defDropdown.style.width = rect.width + 'px';
    
    // allPokemonDataを再確認
    if (typeof allPokemonData !== 'undefined' && allPokemonData && allPokemonData.length > 0) {
      
      // ユニークなポケモン名のみを取得
      const uniqueNames = new Set();
      const uniquePokemon = [];
      
      allPokemonData.forEach(function(pokemon) {
        if (pokemon && pokemon.name && !uniqueNames.has(pokemon.name)) {
          uniqueNames.add(pokemon.name);
          uniquePokemon.push(pokemon);
        }
      });
      
      // 最初の20件を表示
      const displayItems = uniquePokemon.slice(0, 20);
      
      displayItems.forEach(function(pokemon) {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.style.padding = '8px';
        item.style.cursor = 'pointer';
        item.style.borderBottom = '1px solid #eee';
        
        // カタカナ名のみ表示
        item.textContent = pokemon.name;
        
        // ホバー効果
        item.addEventListener('mouseover', function() {
          this.style.backgroundColor = '#f0f0f0';
        });
        
        item.addEventListener('mouseout', function() {
          this.style.backgroundColor = 'transparent';
        });
        
        // クリックイベント
        item.addEventListener('click', function() {
          defPokemonInput.value = pokemon.name;
          defDropdown.style.display = 'none';
          
          // ポケモンデータの更新
          if (typeof currentMyPokemonName !== 'undefined') {
            currentMyPokemonName = pokemon.name;
          }
          
          if (typeof currentMyPokemonTypes !== 'undefined') {
            if (pokemon.type) {
              currentMyPokemonTypes = Array.isArray(pokemon.type) ? pokemon.type : [pokemon.type];
            } else {
              currentMyPokemonTypes = [];
            }
          }
      
          // 与ダメ側の入力欄も更新
          const mainPokemonInput = document.getElementById('searchMyPokemon');
          if (mainPokemonInput) {
            mainPokemonInput.value = pokemon.name;
          }
        });
        
        defDropdown.appendChild(item);
      });
      
      // 「もっと見る」オプション
      if (uniquePokemon.length > 20) {
        const moreItem = document.createElement('div');
        moreItem.className = 'dropdown-item';
        moreItem.style.padding = '8px';
        moreItem.style.textAlign = 'center';
        moreItem.style.fontStyle = 'italic';
        moreItem.style.color = '#666';
        moreItem.textContent = '入力して絞り込み...';
        defDropdown.appendChild(moreItem);
      }
    } else {
      console.error('allPokemonDataが見つかりません');
      const errorItem = document.createElement('div');
      errorItem.className = 'dropdown-item';
      errorItem.style.padding = '8px';
      errorItem.style.color = 'red';
      errorItem.textContent = 'ポケモンデータが読み込まれていません';
      defDropdown.appendChild(errorItem);
      
      // デバッグ情報を表示
      console.log('グローバル変数確認:');
      console.log('allPokemonData:', typeof allPokemonData);
      console.log('pokemonData:', typeof pokemonData);
      console.log('window.allPokemonData:', typeof window.allPokemonData);
    }
    
    // ドロップダウンを表示
    defDropdown.style.display = 'block';
  });
  
  // 入力イベント（フィルタリング）
  defPokemonInput.addEventListener('input', function() {
    const searchText = this.value.toLowerCase();
    
    // 入力がなければドロップダウンを非表示
    if (!searchText) {
      defDropdown.style.display = 'none';
      return;
    }
    
    // ポケモンをフィルタリング
    if (typeof allPokemonData !== 'undefined' && allPokemonData && allPokemonData.length > 0) {
      // ドロップダウンの内容をクリア
      defDropdown.innerHTML = '';
      
      // ひらがな・カタカナ変換
      const hiragana = searchText.replace(/[\u30A1-\u30F6]/g, function(match) {
        return String.fromCharCode(match.charCodeAt(0) - 0x60);
      });
      
      const katakana = searchText.replace(/[\u3041-\u3096]/g, function(match) {
        return String.fromCharCode(match.charCodeAt(0) + 0x60);
      });
      
      // 先頭一致でフィルタリング
      const filteredPokemon = allPokemonData.filter(function(pokemon) {
        if (!pokemon || !pokemon.name) return false;
        
        const name = pokemon.name.toLowerCase();
        const hiraganaName = pokemon.hiragana ? pokemon.hiragana.toLowerCase() : '';
        const romajiName = pokemon.romaji ? pokemon.romaji.toLowerCase() : '';
        
        // 先頭一致に変更
        return name.startsWith(searchText) || 
               name.startsWith(hiragana) || 
               name.startsWith(katakana) || 
               hiraganaName.startsWith(searchText) || 
               hiraganaName.startsWith(hiragana) || 
               hiraganaName.startsWith(katakana) || 
               romajiName.startsWith(searchText);
      });
      
      // ユニークなポケモン名のみ
      const uniqueNames = new Set();
      const uniqueFilteredPokemon = [];
      
      filteredPokemon.forEach(function(pokemon) {
        if (!uniqueNames.has(pokemon.name)) {
          uniqueNames.add(pokemon.name);
          uniqueFilteredPokemon.push(pokemon);
        }
      });
      
      // 最初の20件を表示
      const displayItems = uniqueFilteredPokemon.slice(0, 20);
      
      if (displayItems.length > 0) {
        displayItems.forEach(function(pokemon) {
          const item = document.createElement('div');
          item.className = 'dropdown-item';
          item.style.padding = '8px';
          item.style.cursor = 'pointer';
          item.style.borderBottom = '1px solid #eee';
          
          // カタカナ名のみ表示
          item.textContent = pokemon.name;
          
          // ホバー効果
          item.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#f0f0f0';
          });
          
          item.addEventListener('mouseout', function() {
            this.style.backgroundColor = 'transparent';
          });
          
          // クリックイベント
          item.addEventListener('click', function() {
            defPokemonInput.value = pokemon.name;
            defDropdown.style.display = 'none';
            
            // ポケモンデータの更新
            if (typeof currentMyPokemonName !== 'undefined') {
              currentMyPokemonName = pokemon.name;
            }
            
            if (typeof currentMyPokemonTypes !== 'undefined') {
              if (pokemon.type) {
                currentMyPokemonTypes = Array.isArray(pokemon.type) ? pokemon.type : [pokemon.type];
              } else {
                currentMyPokemonTypes = [];
              }
            }
            
            // 与ダメ側の入力欄も更新
            const mainPokemonInput = document.getElementById('searchMyPokemon');
            if (mainPokemonInput) {
              mainPokemonInput.value = pokemon.name;
            }
          });
          
          defDropdown.appendChild(item);
        });
        
        // 「もっと見る」オプション
        if (uniqueFilteredPokemon.length > 20) {
          const moreItem = document.createElement('div');
          moreItem.className = 'dropdown-item';
          moreItem.style.padding = '8px';
          moreItem.style.textAlign = 'center';
          moreItem.style.fontStyle = 'italic';
          moreItem.style.color = '#666';
          moreItem.textContent = 'さらに' + (uniqueFilteredPokemon.length - 20) + '件...';
          defDropdown.appendChild(moreItem);
        }
      } else {
        // 検索結果がない場合
        const noResultItem = document.createElement('div');
        noResultItem.className = 'dropdown-item';
        noResultItem.style.padding = '8px';
        noResultItem.style.fontStyle = 'italic';
        noResultItem.style.color = '#666';
        noResultItem.textContent = '該当するポケモンが見つかりません';
        defDropdown.appendChild(noResultItem);
      }
      
      // ポジション更新
      const rect = this.getBoundingClientRect();
      defDropdown.style.top = (rect.bottom + window.scrollY) + 'px';
      defDropdown.style.left = (rect.left + window.scrollX) + 'px';
      defDropdown.style.width = rect.width + 'px';
      
      // ドロップダウンを表示
      defDropdown.style.display = 'block';
    }
  });
  
  // ドロップダウン以外をクリックしたらドロップダウンを閉じる
  document.addEventListener('click', function(e) {
    if (e.target !== defPokemonInput && !defDropdown.contains(e.target)) {
      defDropdown.style.display = 'none';
    }
  });
}

// 持ち物の情報を検索する関数
function findItemInfo(itemName) {
  if (!itemName) return null;
  
  // 持ち物データから検索
  return itemData.find(i => i.name === itemName);
}

function calculateRandText(minDamage, maxDamage, defenderHP) {
  // ダメージが0の場合は特別処理
  if (minDamage === 0 && maxDamage === 0) {
    return {
      hits: 0,
      percent: "0.0",
      randLevel: ""
    };
  }

  // 何発で倒せるかの計算
  const minHits = maxDamage > 0 ? Math.ceil(defenderHP / maxDamage) : Infinity; // 最大ダメージを出し続けた場合の最小発数
  const maxHits = minDamage > 0 ? Math.ceil(defenderHP / minDamage) : Infinity; // 最小ダメージで攻撃し続けた場合の最大発数
  
  // ダメージが足りない場合（発数が無限大になる場合）
  if (!isFinite(minHits) || !isFinite(maxHits)) {
    return {
      hits: 0,
      percent: "0.0",
      randLevel: "不可"
    };
  }
  
  // minHits発で倒せる確率を計算
  let knockoutPercent = 0;
  
  // 各発数ケース別の処理
  if (minHits === 1) {
    // 1発で倒せる場合の確率計算
    if (minDamage >= defenderHP) {
      // 最小ダメージで確実に倒せる
      knockoutPercent = 100.0;
    } else {
      // 倒せる確率を計算
      const successfulOutcomes = Math.max(0, maxDamage - Math.max(minDamage, defenderHP) + 1);
      const totalOutcomes = maxDamage - minDamage + 1;
      knockoutPercent = (successfulOutcomes / totalOutcomes) * 100;
    }
  } 
  else if (minHits === 2) {
    // 2発で倒せる場合の確率計算 - すべての組み合わせを考慮
    const totalOutcomes = Math.pow(maxDamage - minDamage + 1, 2); // 全ダメージパターン
    let successfulOutcomes = 0;
    
    // 1発目の各ダメージについて処理
    for (let dmg1 = minDamage; dmg1 <= maxDamage; dmg1++) {
      // 2発目で必要なダメージ
      const requiredDmg2 = defenderHP - dmg1;
      
      if (requiredDmg2 <= 0) {
        // 1発目で倒せた場合
        successfulOutcomes += maxDamage - minDamage + 1; // 2発目のすべてのパターン
      } else if (requiredDmg2 <= maxDamage) {
        // 2発目で倒せる可能性がある場合
        successfulOutcomes += Math.max(0, maxDamage - Math.max(minDamage, requiredDmg2) + 1);
      }
      // それ以外は倒せないので加算しない
    }
    
    knockoutPercent = (successfulOutcomes / totalOutcomes) * 100;
  }
  else if (minHits === 3) {
    // 3発で倒せる場合の確率計算 - 数学的な近似
    // 平均ダメージの計算
    const avgDamage = (minDamage + maxDamage) / 2;
    
    // 2発後の残りHP
    const remainingHP = defenderHP - (avgDamage * 2);
    
    if (remainingHP <= 0) {
      // 平均ダメージを2回与えたら倒せる
      knockoutPercent = 90.0;
    } else if (remainingHP <= minDamage) {
      // 最小ダメージでも倒せる
      knockoutPercent = 80.0;
    } else if (remainingHP <= maxDamage) {
      // 最大ダメージの範囲内
      const ratio = (maxDamage - remainingHP) / (maxDamage - minDamage);
      knockoutPercent = ratio * 70.0; // 70%を上限として比例配分
    } else {
      // 最大ダメージでも足りない
      knockoutPercent = 5.0;
    }
  }
  else {
    // 4発以上の場合は近似計算
    const totalDamageNeeded = defenderHP;
    const minTotalDamage = minDamage * minHits;
    const maxTotalDamage = maxDamage * minHits;
    
    if (minTotalDamage >= totalDamageNeeded) {
      // 最小ダメージでも確実に倒せる
      knockoutPercent = 95.0;
    } else if (maxTotalDamage < totalDamageNeeded) {
      // 最大ダメージでも倒せない
      knockoutPercent = 5.0;
    } else {
      // その間は比例配分
      const ratio = (maxTotalDamage - totalDamageNeeded) / (maxTotalDamage - minTotalDamage);
      knockoutPercent = 5.0 + ratio * 90.0; // 5%〜95%の範囲で比例配分
    }
  }
  
  // 確率を小数点以下1桁に丸める
  knockoutPercent = Math.round(knockoutPercent * 10) / 10;
  
  // 確率が0%未満や100%を超えないように調整
  knockoutPercent = Math.max(0, Math.min(100, knockoutPercent));
  
  // 乱数レベルの判定
  let randLevelText = "";

  // 確率に基づく乱数レベルの判定
  if (minHits === maxHits) {
    // 最小ダメージでもminHits発で確実に倒せる場合は「確定○発」と表示
    if (minDamage * minHits >= defenderHP) {
      randLevelText = "確定";
      knockoutPercent = 100.0;
    } else {
      // 必要発数は同じだが確率によって乱数レベルが変わる
      if (knockoutPercent >= 93.75) {
        randLevelText = "超高乱数";
      } else if (knockoutPercent >= 75.0) {
        randLevelText = "高乱数";
      } else if (knockoutPercent >= 62.5) {
        randLevelText = "中高乱数";
      } else if (knockoutPercent >= 37.5) {
        randLevelText = "中乱数";
      } else if (knockoutPercent >= 25.0) {
        randLevelText = "中低乱数";
      } else if (knockoutPercent > 6.3) {
        randLevelText = "低乱数";
      } else {
        randLevelText = "超低乱数";
      }
    }
  } else {
    // 最小と最大の発数が異なる場合も確率で判定
    if (knockoutPercent >= 97.5) {
      randLevelText = "超高乱数";
    } else if (knockoutPercent >= 75.0) {
      randLevelText = "高乱数";
    } else if (knockoutPercent >= 62.5) {
      randLevelText = "中高乱数";
    } else if (knockoutPercent >= 37.5) {
      randLevelText = "中乱数";
    } else if (knockoutPercent >= 25.0) {
      randLevelText = "中低乱数";
    } else if (knockoutPercent > 6.3) {
      randLevelText = "低乱数";
    } else {
      randLevelText = "超低乱数";
    }
  }
    
    // デバッグ用のログ出力
    //console.log(`ダメージ範囲: ${minDamage}～${maxDamage}, HP: ${defenderHP}`);
    //console.log(`必要発数: ${minHits}, ${minHits}発で倒せる確率: ${knockoutPercent}%`);
    
    // 乱数表記を生成
    return {
      hits: minHits,
      percent: knockoutPercent.toFixed(1),
      randLevel: randLevelText
    };
  }


// HPバーを作成する関数 - 複数回のダメージ履歴に対応（改良版）
function createHPBar(minDamage, maxDamage, totalHP) {
  // 前回のダメージ情報を取得
  const isPrevDamageKept = sessionStorage.getItem('keepDamage') === 'true';
  const damageHistoryJSON = sessionStorage.getItem('damageHistory');
  let damageHistory = [];
  
  // 累積ダメージの変数を初期化
  let cumulativeMinDamage = minDamage;
  let cumulativeMaxDamage = maxDamage;
  
  if (isPrevDamageKept && damageHistoryJSON) {
    try {
      damageHistory = JSON.parse(damageHistoryJSON);
      
      // すべての履歴を合算して累積ダメージを計算
      if (damageHistory.length > 0) {
        // 前回までの履歴からの累積最小・最大ダメージを計算
        let prevMinDamage = 0;
        let prevMaxDamage = 0;
        
        // すべての履歴からダメージを合算
        for (let i = 0; i < damageHistory.length; i++) {
          const entry = damageHistory[i];
          prevMinDamage += entry.minDamage;
          prevMaxDamage += entry.maxDamage;
        }
        
        // 今回のダメージと合算
        cumulativeMinDamage = prevMinDamage + minDamage;
        cumulativeMaxDamage = prevMaxDamage + maxDamage;
      }
    } catch (e) {
      console.error('ダメージ履歴の解析エラー:', e);
    }
  }
  
  // 初期HP（元のHP）
  const originalTotalHP = totalHP;
  
  // 今回のダメージのみを適用した残りHP
  const remainHPAfterMinDamage = Math.max(0, originalTotalHP - minDamage);
  const remainHPAfterMaxDamage = Math.max(0, originalTotalHP - maxDamage);
  
  // 累積ダメージに基づく残りHPの計算
  const remainHPAfterCumulativeMin = Math.max(0, originalTotalHP - cumulativeMinDamage);
  const remainHPAfterCumulativeMax = Math.max(0, originalTotalHP - cumulativeMaxDamage);
  
  // HPゲージのドット数換算（最大48ドット）
  const maxDots = 48;

  // ドット計算の調整関数 - HPの割合から正確なドット数を計算
  function calculateDots(remainHP, totalHP) {
    // HPの割合を計算（0～1の範囲）
    const hpRatio = remainHP / totalHP;
    
    // 単純な掛け算ではなく、ドットごとの境界を考慮
    // 各ドットは totalHP / maxDots の範囲を表す
    const exactDotPosition = hpRatio * maxDots;
    
    // 小数点以下を考慮してドット数を決定
    // 例: 割合が50%ちょうどなら、24ドットではなく24.0ドットになる
    //     これを切り上げて25ドットにする（50%は25ドット目に入る）
    return Math.ceil(exactDotPosition);
  }
  
  // 累積ダメージに基づくドット計算
  const remainCumulativeMinDots = calculateDots(remainHPAfterCumulativeMin, originalTotalHP);
  const remainCumulativeMaxDots = calculateDots(remainHPAfterCumulativeMax, originalTotalHP);
  
  // 従来のドット計算
  const remainMinDots = calculateDots(remainHPAfterMinDamage, originalTotalHP);
  const remainMaxDots = calculateDots(remainHPAfterMaxDamage, originalTotalHP);

  // 表示用の変数（ダメージ保持時は累積値、そうでない場合は単発値）
  const displayMinDots = isPrevDamageKept ? remainCumulativeMinDots : remainMinDots;
  const displayMaxDots = isPrevDamageKept ? remainCumulativeMaxDots : remainMaxDots;
  const displayRemainMinHP = isPrevDamageKept ? remainHPAfterCumulativeMin : remainHPAfterMinDamage;
  const displayRemainMaxHP = isPrevDamageKept ? remainHPAfterCumulativeMax : remainHPAfterMaxDamage;
  
  // 残りHP割合の計算
  const displayRemainMinPercent = (displayRemainMinHP / originalTotalHP * 100).toFixed(1);
  const displayRemainMaxPercent = (displayRemainMaxHP / originalTotalHP * 100).toFixed(1);
  
  // ドットからパーセントに逆算
  const dotPercentage = 100 / maxDots;
  const displayMinDotPercent = displayMinDots * dotPercentage;
  const displayMaxDotPercent = displayMaxDots * dotPercentage;
  
  // generateLayers関数はそのまま（引数の修正のみ）
  function generateLayers() {
    let layers = '';
    
    // ケース2: 残りHPが50%をまたぐ場合
    // 最小ダメージ側が50%以上かつ最大ダメージ側が50%未満の場合
    if (displayMinDots >= 25 && displayMaxDots < 25) {      
      // 最大ダメージ後のHP幅（50%未満 - 黄色）
      layers += `<div id="layer-top-yellow" style="height: 100%; width: ${displayMaxDotPercent}%; background-color: #f8e038 !important; position: absolute; left: 0; top: 0; z-index: 10;"></div>`;
      
      // またぐ場合のHP幅（50%まで - 暗い黄色）
      const halfDotPercent = 24 * dotPercentage;
      layers += `<div id="layer-bottom-green" style="height: 100%; width: ${halfDotPercent}%; background-color: #c8a808 !important; position: absolute; left: 0; top: 0; z-index: 9;"></div>`;

      // 最小ダメージ後のHP幅（50%以上部分 - 暗い緑）
      layers += `<div id="layer-bottom-green" style="height: 100%; width: ${displayMinDotPercent}%; background-color: #58d080 !important; position: absolute; left: 0; top: 0; z-index: 8;"></div>`;
    }
    // ケース1: 残りHPが50%以上の場合（両方とも25ドット以上）
    else if (displayMinDots >= 25 && displayMaxDots >= 25) {
      // 最大ダメージ後のHP幅 - 緑色
      layers += `<div id="layer-top" style="height: 100%; width: ${displayMaxDotPercent}%; background-color: #70f8a8 !important; position: absolute; left: 0; top: 0; z-index: 10;"></div>`;

      // 最小ダメージ後のHP幅 - 暗い緑色
      layers += `<div id="layer-bottom" style="height: 100%; width: ${displayMinDotPercent}%; background-color: #58d080 !important; position: absolute; left: 0; top: 0; z-index: 8;"></div>`;
      
    }
    // ケース4: 残りHPが20%をまたぐ場合
    // 最小ダメージ側が20%以上かつ最大ダメージ側が20%未満の場合
    else if (displayMinDots >= 10 && displayMaxDots < 10) { 
      // 最大ダメージ後のHP幅（20%未満 - 赤色）
      layers += `<div id="layer-top-red" style="height: 100%; width: ${displayMaxDotPercent}%; background-color: #f85838 !important; position: absolute; left: 0; top: 0; z-index: 10;"></div>`;
      
      // またぐ場合のHP幅（20%まで - 暗い赤色）
      const fifthDotPercent = 9 * dotPercentage;
      layers += `<div id="layer-bottom-green" style="height: 100%; width: ${fifthDotPercent}%; background-color: #a84048 !important; position: absolute; left: 0; top: 0; z-index: 9;"></div>`;
      
      // 最小ダメージ後のHP幅（20%未満 - 暗い黄色）
      layers += `<div id="layer-bottom-yellow" style="height: 100%; width: ${displayMinDotPercent}%; background-color: #c8a808 !important; position: absolute; left: 0; top: 0; z-index: 8;"></div>`;
    }
    // ケース3: 残りHPが20%～50%の場合（両方とも10～24ドット）
    else if (displayMinDots >= 10 && displayMinDots < 25 && displayMaxDots >= 10 && displayMaxDots < 25) {    
      // 最大ダメージ後のHP幅 - 黄色
      layers += `<div id="layer-top-yellow" style="height: 100%; width: ${displayMaxDotPercent}%; background-color: #f8e038 !important; position: absolute; left: 0; top: 0; z-index: 10;"></div>`;

      // 最小ダメージ後のHP幅 - 暗い黄色
      layers += `<div id="layer-bottom-yellow" style="height: 100%; width: ${displayMinDotPercent}%; background-color: #c8a808 !important; position: absolute; left: 0; top: 0; z-index: 8;"></div>`;
    }
    // ケース5: 残りHPが20%未満の場合（両方とも9ドット以下）
    else if (displayMinDots < 10 && displayMaxDots < 10) {
      // 最大ダメージ後のHP幅 - 赤色
      layers += `<div id="layer-top-red" style="height: 100%; width: ${displayMaxDotPercent}%; background-color: #f85838 !important; position: absolute; left: 0; top: 0; z-index: 10;"></div>`;

      // 最小ダメージ後のHP幅 - 暗い赤色
      layers += `<div id="layer-bottom-red" style="height: 100%; width: ${displayMinDotPercent}%; background-color: #a84048 !important; position: absolute; left: 0; top: 0; z-index: 8;"></div>`;
    }
    
    return layers;
  }
  
  // ドット表示のためのマーカーを生成
  function generateDotMarkers() {
    let markers = '';
    const dotWidth = 100 / maxDots; // 1ドットあたりの幅（%単位）
    
    // 各ドット位置にマーカーを追加
    for (let i = 1; i < maxDots; i++) {
      const position = i * dotWidth;
      markers += `<div style="height: 100%; width: 1px; background-color: rgba(0,0,0,0.2); position: absolute; left: ${position}%; top: 0; z-index: 20;"></div>`;
    }
    
    return markers;
  }
  let hpBarHtml = '';

  if (displayRemainMaxHP == displayRemainMinHP){
    hpBarHtml = `
    <div style="margin: 10px 0; width: 100%; position: relative;">
      <!-- HPバー本体 -->
      <div style="height: 15px; width: 100%; background-color: #506858; border-radius: 5px; position: relative; overflow: hidden;">
        <!-- 動的に生成されるレイヤー -->
        ${generateLayers()}
        
        <!-- ドット間隔マーカー -->
        ${generateDotMarkers()}
      </div>
      
      <!-- HP情報 - 累積ダメージに基づく表示 -->
      <div style="text-align: center; margin-top: 3px; font-size: 0.85em; color: #777;">
        <div>HP: ${displayRemainMaxHP}/${originalTotalHP} (${displayRemainMaxPercent}%)</div>
        <div>ドット: [${displayMaxDots}/48]</div>
      </div>
    `;
  }
  else {
  // HPバーのHTML
  hpBarHtml = `
  <div style="margin: 10px 0; width: 100%; position: relative;">
    <!-- HPバー本体 -->
    <div style="height: 15px; width: 100%; background-color: #506858; border-radius: 5px; position: relative; overflow: hidden;">
      <!-- 動的に生成されるレイヤー -->
      ${generateLayers()}
      
      <!-- ドット間隔マーカー -->
      ${generateDotMarkers()}
    </div>
    
    <!-- HP情報 - 累積ダメージに基づく表示 -->
    <div style="text-align: center; margin-top: 3px; font-size: 0.85em; color: #777;">
      <div>HP: ${displayRemainMaxHP}~${displayRemainMinHP}/${originalTotalHP} (${displayRemainMaxPercent}%~${displayRemainMinPercent}%)</div>
      <div>ドット: [${displayMaxDots}~${displayMinDots}/48]</div>
    </div>
  `;
  }
  return hpBarHtml;
}
// ダメージ情報のみを生成する関数（完全に分離）
function generateDamageInfo(minDamage, maxDamage, totalHP, randLevelText, hits, knockoutPercent) {
  // 前回のダメージ情報を取得
  const isPrevDamageKept = sessionStorage.getItem('keepDamage') === 'true';
  const damageHistoryJSON = sessionStorage.getItem('damageHistory');
  
  // 累積ダメージの変数を初期化
  let cumulativeMinDamage = minDamage;
  let cumulativeMaxDamage = maxDamage;
  
  // 累積ダメージを計算
  if (isPrevDamageKept && damageHistoryJSON) {
    try {
      const damageHistory = JSON.parse(damageHistoryJSON);
      
      if (damageHistory.length > 0) {
        let prevMinDamage = 0;
        let prevMaxDamage = 0;
        
        for (const entry of damageHistory) {
          prevMinDamage += entry.minDamage;
          prevMaxDamage += entry.maxDamage;
        }
        
        cumulativeMinDamage = prevMinDamage + minDamage;
        cumulativeMaxDamage = prevMaxDamage + maxDamage;
      }
    } catch (e) {
      console.error('履歴の解析エラー:', e);
    }
  }
  
  // ダメージ情報HTML
  if (isPrevDamageKept) {
    if(cumulativeMinDamage == cumulativeMaxDamage){
      return `
      <div style="text-align: center; margin-top: 3px;">
        <div>累積ダメージ: ${cumulativeMinDamage}</div>
        <div>累積割合: ${(cumulativeMinDamage / totalHP * 100).toFixed(1)}%</div>
      </div>
    `;
    }
    else {
    // 累積ダメージ情報のみを表示
    return `
      <div style="text-align: center; margin-top: 3px;">
        <div>累積ダメージ: ${cumulativeMinDamage}～${cumulativeMaxDamage}</div>
        <div>累積割合: ${(cumulativeMinDamage / totalHP * 100).toFixed(1)}%～${(cumulativeMaxDamage / totalHP * 100).toFixed(1)}%</div>
      </div>
    `;
  }
  } else {
    if(hits ==0){
      // 固定ダメージ
      return `
      <div style="text-align: center; margin-top: 3px;">
        <div>ダメージ: ${minDamage}</div>
        <div>割合: ${(minDamage / totalHP * 100).toFixed(1)}%</div>
        <div>回数: 不可 (${knockoutPercent}%)</div>
      </div>
    `;
    }
    else if(minDamage == maxDamage){
      // 固定ダメージ
      return `
      <div style="text-align: center; margin-top: 3px;">
        <div>ダメージ: ${minDamage}</div>
        <div>割合: ${(minDamage / totalHP * 100).toFixed(1)}%</div>
        <div>回数: ${randLevelText === "確定" ? `確定${hits}発` : `${randLevelText}${hits}発 (${knockoutPercent}%)`}</div>
      </div>
    `;
    }
    else {
    // 通常のダメージ情報（回数情報あり）
    return `
      <div style="text-align: center; margin-top: 3px;">
        <div>ダメージ: ${minDamage}～${maxDamage}</div>
        <div>割合: ${(minDamage / totalHP * 100).toFixed(1)}%～${(maxDamage / totalHP * 100).toFixed(1)}%</div>
        <div>回数: ${randLevelText === "確定" ? `確定${hits}発` : `${randLevelText}${hits}発 (${knockoutPercent}%)`}</div>
      </div>
    `;
    }
  }
}
// ダメージ履歴を管理する関数
function manageDamageHistory(minDamage, maxDamage, totalHP) {
  // 既存の履歴を取得
  let damageHistory = [];
  let cumulativeMinDamage = minDamage;
  let cumulativeMaxDamage = maxDamage;
  
  try {
    const historyJson = sessionStorage.getItem('damageHistory');
    if (historyJson) {
      damageHistory = JSON.parse(historyJson);
      
      // 前回までの累積ダメージを計算
      if (damageHistory.length > 0) {
        cumulativeMinDamage = damageHistory.reduce((sum, entry) => sum + entry.minDamage, 0) + minDamage;
        cumulativeMaxDamage = damageHistory.reduce((sum, entry) => sum + entry.maxDamage, 0) + maxDamage;
      }
    }
  } catch (e) {
    console.error('履歴の解析エラー:', e);
    damageHistory = [];
  }
  
  // 新しいダメージエントリを追加
  damageHistory.push({
    minDamage: minDamage,
    maxDamage: maxDamage,
    totalHP: totalHP,
    timestamp: Date.now()
  });
  
  // 履歴を保存
  sessionStorage.setItem('damageHistory', JSON.stringify(damageHistory));
  sessionStorage.setItem('cumulativeMinDamage', cumulativeMinDamage.toString());
  sessionStorage.setItem('cumulativeMaxDamage', cumulativeMaxDamage.toString());
  
  return {
    damageHistory,
    cumulativeMinDamage,
    cumulativeMaxDamage
  };
}

// 結果を新しいブロックに表示する関数（改良版）
function displayResultInNewBlock(resultText, minDamage, maxDamage, totalHP) {
  // ページを離れる時やリロード時にチェックを外す処理を追加
  window.addEventListener('beforeunload', function() {
    // チェックを外してセッションストレージのデータをクリア
    sessionStorage.removeItem('keepDamage');
    sessionStorage.removeItem('damageHistory');
    sessionStorage.removeItem('minDamage');
    sessionStorage.removeItem('maxDamage');
    sessionStorage.removeItem('totalHP');
  });
  
  // 新しい結果ブロックを作成（既存ブロックは上書きしない）
  let giveResultBlock = document.getElementById('giveResultBlock');
  
  if (!giveResultBlock) {
    // 存在しない場合は新規作成
    giveResultBlock = document.createElement('div');
    giveResultBlock.id = 'giveResultBlock';
    giveResultBlock.className = 'highlighted-result';
    giveResultBlock.style.padding = '10px';
    giveResultBlock.style.marginBottom = '4px';
    giveResultBlock.style.backgroundColor = '#f0f8ff';
    giveResultBlock.style.border = '1px solid #add8e6';
    giveResultBlock.style.borderRadius = '5px';
    giveResultBlock.style.fontWeight = 'bold';
    
    // タイムスタンプ属性を追加
    giveResultBlock.setAttribute('data-timestamp', '0');
    
    // 結果セクションに追加
    const resultsSection = document.querySelector('.results-section');
    if (resultsSection) {
      resultsSection.appendChild(giveResultBlock);
    }
  }
  
  // 現在のタイムスタンプを更新
  giveResultBlock.setAttribute('data-timestamp', Date.now().toString());
  
  // 見出しを追加
  const heading = document.createElement('div');
  heading.className = 'result-heading';
  heading.style.fontWeight = 'bold';
  heading.style.marginBottom = '10px';
  heading.style.color = '#0066cc';
  heading.style.textAlign = 'center';
  heading.textContent = '与ダメージ計算結果';
  
  // 結果ブロックの内容を設定
  giveResultBlock.innerHTML = '';
  giveResultBlock.appendChild(heading);
  
  // データを保持するかどうかの現在の状態を取得
  const keepDamage = sessionStorage.getItem('keepDamage') === 'true';
  
  // 結果テキストを追加
  const contentNode = document.createElement('div');
  contentNode.style.textAlign = 'center';
  contentNode.innerHTML = resultText;
  giveResultBlock.appendChild(contentNode);
  
  // 結果保持チェックボックスを追加
  const checkboxContainer = document.createElement('div');
  checkboxContainer.style.marginTop = '10px';
  checkboxContainer.style.textAlign = 'center';
  checkboxContainer.style.fontSize = '0.9em';
  checkboxContainer.style.display = 'flex';
  checkboxContainer.style.alignItems = 'center';
  checkboxContainer.style.justifyContent = 'center';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'keepDamageResult';
  checkbox.checked = keepDamage;
  checkbox.style.margin = '0';
  
  const checkboxLabel = document.createElement('label');
  checkboxLabel.htmlFor = 'keepDamageResult';
  checkboxLabel.textContent = 'ダメージ結果を保持する';
  checkboxLabel.style.marginLeft = '5px';
  checkboxLabel.style.display = 'inline-block';
  
  checkboxContainer.appendChild(checkbox);
  checkboxContainer.appendChild(checkboxLabel);
  giveResultBlock.appendChild(checkboxContainer);
  
  // チェックボックスのイベントリスナーを追加
  checkbox.addEventListener('change', function() {
    if (this.checked) {
      sessionStorage.setItem('keepDamage', 'true');
      console.log('ダメージ保持をオンにしました');
    } else {
      sessionStorage.removeItem('keepDamage');
      sessionStorage.removeItem('damageHistory');
      console.log('ダメージ履歴をクリアしました');
    }
  });
  
  // 現在のダメージを記録（次回計算時に履歴に追加される）
  sessionStorage.setItem('currentMinDamage', minDamage.toString());
  sessionStorage.setItem('currentMaxDamage', maxDamage.toString());
  sessionStorage.setItem('currentTotalHP', totalHP.toString());

  // ブロックを表示
  giveResultBlock.style.display = 'block';
  
  // 表示順序を更新
  updateResultBlocksOrder();
}

// HPバー部分だけを更新する関数（履歴ありバージョン）
function updateResultTextWithHistory(resultText, minDamage, maxDamage, totalHP, damageInfo) {
  // 既存のHPバー部分を特定して置換
  const hpBarRegex = /<div style="margin: 10px 0; width: 100%; position: relative;">.*?<\/div>\s*<\/div>\s*<\/div>/s;
  const newHPBar = createHPBar(minDamage, maxDamage, totalHP);
  
  return resultText.replace(hpBarRegex, newHPBar);
}

// HPバー部分だけを更新する関数（履歴なしバージョン）
function updateResultTextWithoutHistory(resultText, minDamage, maxDamage, totalHP) {
  // セッションストレージから履歴を一時的に削除
  const oldHistory = sessionStorage.getItem('damageHistory');
  sessionStorage.removeItem('damageHistory');
  
  // 既存のHPバー部分を特定して置換
  const hpBarRegex = /<div style="margin: 10px 0; width: 100%; position: relative;">.*?<\/div>\s*<\/div>\s*<\/div>/s;
  const newHPBar = createHPBar(minDamage, maxDamage, totalHP);
  
  // 履歴を復元（必要に応じて）
  if (oldHistory) {
    sessionStorage.setItem('damageHistory', oldHistory);
  }
  
  return resultText.replace(hpBarRegex, newHPBar);
}

// ポケモンの情報を検索する関数
function findPokemonInfo(pokemonName) {
  if (!pokemonName) return null;
  
  // 全ポケモンデータから検索
  return allPokemonData.find(p => p.name === pokemonName);
}

// 技の情報を検索する関数
function findMoveInfo(moveName) {
  if (!moveName) return null;
  
  // 技データから検索
  return moveData.find(m => m.name === moveName);
}

// 青いブロックの表示順を制御する共通関数
function updateResultBlocksOrder() {
// 結果ブロックを表示する親要素を取得
const resultsSection = document.querySelector('.results-section') || 
document.getElementById('estimateResult').parentNode;
if (!resultsSection) return;

// 計算結果見出し（h2）を特定
const resultHeading = resultsSection.querySelector('h2');
const resultBorder = resultHeading ? resultHeading.nextElementSibling : null;

// 各ブロックへの参照を取得
const physicalBlock = document.getElementById('physicalResultBlock');
const specialBlock = document.getElementById('specialResultBlock');
const giveBlock = document.getElementById('giveResultBlock');

// 順序を追跡するタイムスタンプ属性を確認する
const getBlockTimestamp = (block) => {
if (!block) return 0;
return parseInt(block.getAttribute('data-timestamp') || '0');
};

// 存在するブロックを時間順に並べる（新しいものが上に来るように）
const blocks = [];
if (physicalBlock && physicalBlock.style.display !== 'none') blocks.push(physicalBlock);
if (specialBlock && specialBlock.style.display !== 'none') blocks.push(specialBlock);
if (giveBlock && giveBlock.style.display !== 'none') blocks.push(giveBlock);

// タイムスタンプで降順ソート（新しいものが先頭に）
blocks.sort((a, b) => {
return getBlockTimestamp(b) - getBlockTimestamp(a);
});

// DOM内の位置を再配置
if (blocks.length > 0 && resultBorder) {
// 見出しとボーダーの後に最新の結果から順番に配置する
for (let i = 0; i < blocks.length; i++) {
if (i === 0) {
// 最初のブロックはボーダーの直後に配置
resultBorder.after(blocks[i]);
} else {
// 残りのブロックは順番に配置
blocks[i-1].after(blocks[i]);
}
}
} else if (blocks.length > 0) {
// 見出しが見つからない場合の代替処理
for (let i = 1; i < blocks.length; i++) {
blocks[i-1].after(blocks[i]);
}
}
}