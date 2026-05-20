// Mock Data representing CUSTOMERS
const CUSTOMERS = {
    "900101-1234567": {
        name: "김현대",
        rrn: "910101-1234567",
        insurance_age: 33,
        gender: "남",
        job: "경영사무직 / 1급",
        consent: "동의",
        consent_end: "2026-12-11",
        contract_summary: {
            "현대해상": ["3건", "120,000원"],
            "손해보험": ["2건", "210,000원"],
            "생명보험": ["5건", "95,000원"],
            "기타": ["1건", "30,000원"]
        },
        history: [
            ["가입이력", "실손보험 가입(2022-05-01)"],
            ["가입이력", "건강보험 가입(2024-09-15)"],
            ["기왕력", "위염 치료 이력(경증, 완치)"],
            ["기왕력", "최근 5년 내 입원 없음"],
            ["기왕력", "3개월 내 추가 검사 없음"],
            ["기왕력", "혈압/당뇨 추가 고지사항 없음"],
            ["기가입", "운전자 특약 유지 중"]
        ],
        products: [
            "표준 2Q PASS",
            "퍼펙트종합(10년고지)",
            "내삶N(3.9.9.9)"
        ],
        plans: []
    },
    "900101-1000000": {
        name: "이샘플",
        rrn: "900101-1000000",
        insurance_age: 36,
        gender: "남",
        job: "사무직 / 1급",
        consent: "동의",
        consent_end: "2026-12-11",
        contract_summary: {
            "현대해상": ["1건", "89,000원"],
            "손해보험": ["1건", "110,000원"],
            "생명보험": ["2건", "72,000원"],
            "기타": ["0건", "0원"]
        },
        history: [
            ["가입이력", "운전자보험 가입(2023-03-04)"],
            ["기왕력", "알레르기 비염 통원 치료"],
            ["기왕력", "최근 2년 수술 이력 없음"],
            ["기왕력", "최근 3개월 약 처방 이력 없음"]
        ],
        products: [
            "원클릭 종합플랜",
            "실속 간편플랜",
            "표준 건강플랜"
        ],
        plans: []
    }
};

function generatePlanId() {
    return "L026" + Math.floor(10000000 + Math.random() * 90000000).toString();
}

let currentCustomer = null;
let isPreliminary = false; // 가설계 모드 여부

// DOM Elements
const screen1 = document.getElementById('screen1');
const screen2 = document.getElementById('screen2');
const screenTitle = document.getElementById('screen-title');
const rrnInput = document.getElementById('rrn-input');

// Screen 2 Data Elements
const custNameTitle = document.getElementById('cust-name-title');
const custInfoText = document.getElementById('cust-info-text');
const summaryGrid = document.getElementById('summary-grid');
const productList = document.getElementById('product-list');
const historyTbody = document.getElementById('history-tbody');
const planTbody = document.getElementById('plan-tbody');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Search Buttons
    document.getElementById('search-btn-icon').addEventListener('click', lookupCustomer);
    document.getElementById('search-btn-main').addEventListener('click', lookupCustomer);
    
    // AI Button
    document.getElementById('run-ai-btn').addEventListener('click', runAiDesign);
    
    // Close / Back Button
    document.getElementById('close-btn').addEventListener('click', () => {
        showScreen(1);
    });

    // Handle Enter Key in input
    rrnInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            lookupCustomer();
        }
    });

    // Modal Close
    document.getElementById('modal-close-btn').addEventListener('click', hideModal);

    // Type Select Modal buttons
    document.getElementById('type-illness-btn').addEventListener('click', () => {
        hideTypeSelectModal();
        generatePreliminaryPlans('유병자');
    });
    document.getElementById('type-standard-btn').addEventListener('click', () => {
        hideTypeSelectModal();
        generatePreliminaryPlans('표준형');
    });

    // Custom Design Modal buttons
    document.getElementById('cd-close-btn').addEventListener('click', hideCustomDesignModal);
    document.getElementById('cd-submit-btn').addEventListener('click', submitCustomDesign);
    
    // Plan Detail Modal close button
    document.getElementById('pd-close-btn').addEventListener('click', hidePlanDetailModal);

    // Audit Modal buttons
    document.getElementById('btn-audit-view').addEventListener('click', showAuditModal);
    document.getElementById('audit-close-btn').addEventListener('click', hideAuditModal);

    // Sim Modal buttons
    document.getElementById('btn-sim-view').addEventListener('click', showSimModal);
    document.getElementById('sim-close-x').addEventListener('click', hideSimModal);
    document.getElementById('sim-close-btn').addEventListener('click', hideSimModal);

    // Compare Modal buttons
    document.getElementById('btn-compare-plans').addEventListener('click', showCompareModal);
    document.getElementById('btn-pd-compare').addEventListener('click', showCompareModal);
    document.getElementById('compare-close-btn').addEventListener('click', hideCompareModal);
    document.getElementById('compare-close-x').addEventListener('click', hideCompareModal);

    // Contract Detail Modal buttons
    document.getElementById('cd-modal-close-btn').addEventListener('click', hideContractDetailModal);
    document.getElementById('cd-modal-close-x').addEventListener('click', hideContractDetailModal);

    // AI Specs Modal button
    document.getElementById('btn-ai-specs').addEventListener('click', showAiSpecsModal);
    document.getElementById('ai-specs-close-x').addEventListener('click', hideAiSpecsModal);
    
    // My Plan Modal buttons
    document.getElementById('btn-import-plan').addEventListener('click', () => {
        const type = document.querySelector('input[name="import_type"]:checked')?.value;
        if (type === '내 설계 불러오기') {
            showMyPlanModal();
        } else if (type === '추천설계 불러오기') {
            showRecommendedPlanModal();
        } else {
            showAlert("안내", "해당 기능은 준비 중입니다.");
        }
    });
    document.getElementById('my-plan-close-x').addEventListener('click', hideMyPlanModal);
    document.getElementById('recommended-plan-close-x').addEventListener('click', hideRecommendedPlanModal);

    // AI Result Modal close
    document.getElementById('ai-result-close-x').addEventListener('click', hideAiResultModal);
    document.getElementById('ai-result-close-btn').addEventListener('click', hideAiResultModal);


    // 태아보험 라디오 토글
    const productRadios = document.querySelectorAll('input[name="product"]');
    productRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.getElementById('prenatal-options').style.display = (e.target.value === '태아보험') ? 'block' : 'none';
        });
    });

    document.getElementById('btn-import-ai-request').addEventListener('click', handleImportAiRequest);
    document.getElementById('btn-recommended-ai-request').addEventListener('click', handleRecommendedAiRequest);
    
    document.getElementById('btn-cumulative-sim').addEventListener('click', showSimModal);
    document.getElementById('btn-underwriting-view').addEventListener('click', showAuditModal);
    document.getElementById('btn-compare-plans').addEventListener('click', showCompareModal);
    document.getElementById('btn-memo').addEventListener('click', showMemoModal);

    // Memo textarea character counter
    const memoTextEl = document.getElementById('memo-text');
    if (memoTextEl) {
        memoTextEl.addEventListener('input', () => {
            document.getElementById('memo-char-current').textContent = memoTextEl.value.length;
        });
    }
});

function showScreen(screenNum) {
    if (screenNum === 1) {
        screen1.classList.add('active');
        screen2.classList.remove('active');
        screenTitle.innerText = "1. 도입_고객정보 입력";
        currentCustomer = null;
        
        // Reset plans
        planTbody.innerHTML = '<tr class="empty-row"><td colspan="11">AI 설계를 실행해주세요.</td></tr>';
        resetStepper();
    } else {
        screen1.classList.remove('active');
        screen2.classList.add('active');
        screenTitle.innerText = "2. 설계 요청(동의고객)";
    }
}

function showAlert(title, message) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerText = message;
    document.getElementById('alert-modal').classList.add('show');
}

function hideModal() {
    document.getElementById('alert-modal').classList.remove('show');
}

function lookupCustomer() {
    const rrn = rrnInput.value.trim();
    let grade = document.getElementById('grade-input').value;
    
    // 13자리 주민번호 확인 (숫자7-숫자7 또는 숫자13)
    const isFullRRN = rrn.match(/^(\d{6})-?(\d{7})$/);

    if (!grade) {
        grade = "1"; // 선택하지 않은 경우 기본 1급으로 세팅
    }
    
    // 가설계 판별: "900101-1" 또는 "9001011" 형태 (6자리 생년월일 + 성별 1자리)
    const prelimMatch = rrn.match(/^(\d{6})-?([12])$/);
    
    if (prelimMatch) {
        // 가설계 모드
        isPreliminary = true;
        const birthStr = prelimMatch[1];
        const genderCode = prelimMatch[2];
        const gender = genderCode === '1' ? '남' : '여';
        
        // 생년월일에서 보험나이 계산 (간이)
        const birthYear = parseInt(birthStr.substring(0, 2));
        const fullYear = birthYear >= 50 ? 1900 + birthYear : 2000 + birthYear;
        const age = new Date().getFullYear() - fullYear;
        
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
        
        currentCustomer = {
            name: "가설계고객",
            rrn: rrn,
            insurance_age: age,
            gender: gender,
            grade: grade,
            job: `미확인 / ${grade}급`,
            consent: "미동의 (가설계)",
            consent_end: "-",
            contract_summary: {
                "현대해상": ["- 건", "- 원"],
                "손해보험": ["- 건", "- 원"],
                "생명보험": ["- 건", "- 원"],
                "기타": ["- 건", "- 원"]
            },
            history: [],
            products: [
                "표준 2Q PASS",
                "퍼펙트종합(10년고지)",
                "내삶엔 3.9.9.9"
            ],
            plans: [],
            _birthStr: birthStr,
            _dateStr: dateStr
        };
        
        populateCustomer(currentCustomer);
        applyPreliminaryMode(true);
        showScreen(2);
        return;
    }
    
    // 일반 고객 조회
    const customer = CUSTOMERS[rrn];
    
    if (!customer) {
        showAlert("조회 결과", "샘플 데이터가 없습니다.\n\n• 동의고객: 900101-1234567 또는 900101-1000000\n• 가설계: 생년월일6자리-성별1자리 (예: 900101-1)");
        return;
    }
    
    isPreliminary = false;
    currentCustomer = customer;
    populateCustomer(customer);
    applyPreliminaryMode(false);
    showScreen(2);
}

function applyPreliminaryMode(isPrelim) {
    const customRadio = document.getElementById('custom-ai-radio');
    const customOption = document.getElementById('custom-ai-option');
    const oneClickRadio = document.querySelector('input[value="원클릭AI설계(종합보험)"]');
    
    const productsCard = document.querySelector('.bottom-left');
    
    if (isPrelim) {
        // 맞춤 AI설계 활성화 (가설계 모드에서도 가능하도록 변경)
        customRadio.disabled = false;
        customOption.classList.remove('disabled');
        oneClickRadio.checked = true;
        
        // 스크린 타이틀 변경
        screenTitle.innerText = "2. 설계 요청(가설계고객)";
        
        // 인수가능 상품 유형 숨기기
        if (productsCard) productsCard.style.display = 'none';
    } else {
        // 맞춤 AI설계 활성화
        customRadio.disabled = false;
        customOption.classList.remove('disabled');
        oneClickRadio.checked = true;
        
        screenTitle.innerText = "2. 설계 요청(동의고객)";
        
        // 인수가능 상품 유형 보이기
        if (productsCard) productsCard.style.display = 'flex';
    }
}

function populateCustomer(customer) {
    // Header
    custNameTitle.innerText = `${customer.name}  ${customer.rrn}`;
    
    // Info text
    let infoHtml = `나이/성별 : ${customer.insurance_age}세 (${customer.gender})`;
    if (customer.grade) {
        infoHtml += ` &nbsp;|&nbsp; <strong style="color: var(--primary);">${customer.grade}급</strong>`;
    }
    infoHtml += `<br>
        직업정보 : ${customer.job}<br>
        개인정보 동의여부 : ${customer.consent}<br>
        동의종료일 : ${customer.consent_end}
    `;

    // 실손보험 가입 이력 추출
    const silsonHistory = customer.history.find(h => h[1].includes("실손보험"));
    if (silsonHistory) {
        infoHtml += `<br><span style="color: #d32f2f; font-weight: 600;">실손보험 가입 이력 : ${silsonHistory[1].replace("실손보험 가입", "") || "-"} (4세대)</span>`;
    }

    if (!isPreliminary) {
        infoHtml += `<div style="margin-top: 15px;"><button class="btn btn-outline" style="width: 100%; border-color: #3b82f6; color: #3b82f6; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600;" onclick="showPrintModal()"><span class="material-symbols-outlined" style="font-size: 18px;">print</span>출력하기</button></div>`;
    }

    custInfoText.innerHTML = infoHtml;
    
    // Summary
    summaryGrid.innerHTML = '';
    const companies = ["현대해상", "손해보험", "생명보험", "기타"];
    companies.forEach(company => {
        const data = customer.contract_summary[company] || ["0건", "0원"];
        const div = document.createElement('div');
        div.className = 'summary-item';
        div.innerHTML = `
            <div class="label">${company}</div>
            <div class="value">${data[0]}<br>${data[1]}</div>
        `;
        div.onclick = () => {
            if (data[0] !== "0건" && data[0] !== "- 건") {
                showContractDetailModal(company);
            }
        };
        summaryGrid.appendChild(div);
    });
    
    // Products
    productList.innerHTML = '';
    customer.products.forEach(prod => {
        const li = document.createElement('li');
        li.innerText = prod;
        productList.appendChild(li);
    });
    
    // History (Removed per user request - moved to customer info)
    /*
    historyTbody.innerHTML = '';
    if (customer.history.length === 0) { ... }
    */
}

function runAiDesign() {
    if (!currentCustomer) {
        showAlert("안내", "먼저 고객 조회를 해주세요.");
        return;
    }
    
    // 맞춤 AI설계 선택되었는지 확인
    const designType = document.querySelector('input[name="design_type"]:checked');
    if (designType && designType.value === '맞춤 AI설계') {
        showCustomDesignModal();
        return;
    }

    // 가설계 모드면 유형 선택 모달 표시
    if (isPreliminary) {
        showTypeSelectModal();
        return;
    }
    
    // 원클릭 AI설계: 3개 모델 결과 생성 후 누적 추가
    showLoadingOverlay(() => {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
        
        const newPlans = [
            [currentCustomer.plans.length + 1, "고객 개인화 추천", "AI", currentCustomer.name, generatePlanId(), "표준 2Q PASS", dateStr, "80,160", "20.8", "할증, 부담보", ""],
            [currentCustomer.plans.length + 2, "베테랑 설계 따라하기", "AI", currentCustomer.name, generatePlanId(), "퍼펙트 종합(10년고지)", dateStr, "166,900", "14.5", "정상", ""],
            [currentCustomer.plans.length + 3, "우리 지점 트렌드", "AI", currentCustomer.name, generatePlanId(), "내삶엔 3.9.9.9", dateStr, "151,950", "19.7", "누적조정", ""]
        ];

        currentCustomer.plans.push(...newPlans);
        renderPlans(currentCustomer.plans);
        updateAiResultPopupCards(newPlans);
        showAiResultModal();
    });
}

function generatePreliminaryPlans(type) {
    const birthStr = currentCustomer._birthStr;
    const dateStr = currentCustomer._dateStr;
    let productName, plans;
    
    if (type === '유병자') {
        productName = "간편 3.10.10";
        plans = [
            ["AI", "고객 개인화 추천", 1, "가설계고객", generatePlanId(), productName, dateStr, "85,300", "19.4", "가심사", ""],
            ["AI", "베테랑 설계 따라하기", 2, "가설계고객", generatePlanId(), productName, dateStr, "112,600", "16.8", "가심사", ""],
            ["AI", "우리 지점 트렌드", 3, "가설계고객", generatePlanId(), productName, dateStr, "97,400", "18.1", "가심사", ""]
        ];
    } else {
        productName = "퍼펙트 플러스";
        plans = [
            ["AI", "고객 개인화 추천", 1, "가설계고객", generatePlanId(), productName, dateStr, "78,500", "18.2", "가심사", ""],
            ["AI", "베테랑 설계 따라하기", 2, "가설계고객", generatePlanId(), productName, dateStr, "145,200", "15.7", "가심사", ""],
            ["AI", "우리 지점 트렌드", 3, "가설계고객", generatePlanId(), productName, dateStr, "132,800", "17.1", "가심사", ""]
        ];
    }
    
    const newPlans = plans;
    currentCustomer.plans.push(...newPlans);
    showLoadingOverlay(() => {
        renderPlans(currentCustomer.plans);
        updateAiResultPopupCards(newPlans);
        showAiResultModal();
    });
}

function renderPlans(plans) {
    planTbody.innerHTML = '';
    window.selectedPlanIndices = window.selectedPlanIndices || [];
    
    plans.forEach((plan, idx) => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        
        if (window.selectedPlanIndices.includes(idx)) {
            tr.classList.add('selected-row');
        }

        tr.onclick = () => {
            const currentIdx = window.selectedPlanIndices.indexOf(idx);
            if (currentIdx > -1) {
                // Deselect
                window.selectedPlanIndices.splice(currentIdx, 1);
                tr.classList.remove('selected-row');
            } else {
                // Select
                if (window.selectedPlanIndices.length >= 5) {
                    showAlert("안내", "최대 5개 플랜까지만 비교 가능합니다.");
                    return;
                }
                window.selectedPlanIndices.push(idx);
                tr.classList.add('selected-row');
            }
        };
        
        let html = '';
        plan.forEach((item, pIdx) => {
            if (pIdx === 9) {
                let color = '#28a745';
                if (item.includes('부담보') || item.includes('할증')) color = '#dc3545';
                else if (item.includes('조정')) color = '#fd7e14';
                else if (item.includes('가심사')) color = '#9b59b6';
                html += `<td><span style="color: ${color}; font-weight: 600;">${item}</span></td>`;
            } else if (pIdx === 10) {
                // 메모 컬럼
                if (item && item.trim()) {
                    html += `<td><span class="memo-badge" title="${item}" onclick="event.stopPropagation(); openMemoForPlan(${idx})">${item}</span></td>`;
                } else {
                    html += `<td></td>`;
                }
            } else if (pIdx === 1) {
                html += `<td><a class="plan-link" onclick='event.stopPropagation(); showPlanDetail(${JSON.stringify(plan).replace(/'/g, "&#39;")})'>${item}</a></td>`;
            } else {
                html += `<td class="${pIdx === 7 ? 'text-right' : ''}">${item}</td>`;
            }
        });
        tr.innerHTML = html;
        planTbody.appendChild(tr);
    });
}

function showTypeSelectModal() {
    document.getElementById('type-select-modal').classList.add('show');
}

function hideTypeSelectModal() {
    document.getElementById('type-select-modal').classList.remove('show');
}

function showCustomDesignModal() {
    // 인기담보 라벨 업데이트
    if (currentCustomer) {
        const ageGroup = Math.floor(currentCustomer.insurance_age / 10) * 10;
        const label = document.getElementById('popular-label');
        label.textContent = `★ '${ageGroup}대 ${currentCustomer.gender}' 고객의 상위10개 질병담보`;
    }
    document.getElementById('custom-design-modal').classList.add('show');
}

function hideCustomDesignModal() {
    document.getElementById('custom-design-modal').classList.remove('show');
}

function submitCustomDesign() {
    // 선택된 상품 수집 (라디오 버튼)
    const selectedProduct = document.querySelector('input[name="product"]:checked')?.value;
    const selectedCoverages = Array.from(document.querySelectorAll('input[name="coverage"]:checked')).map(c => c.value);
    const selectedPremium = document.querySelector('input[name="premium"]:checked')?.value || '헬퍼추천';
    
    if (!selectedProduct) {
        hideCustomDesignModal();
        showAlert("안내", "상품 구분을 선택해주세요.");
        return;
    }
    
    // 상품명 결정
    let productName = "맞춤 종합플랜";
    if (selectedProduct === '종합보험_유병자') {
        productName = "맞춤 간편플랜";
    } else if (selectedProduct === '운전자보험') {
        productName = "맞춤 운전자플랜";
    } else if (selectedProduct === '간병치매보험') {
        productName = "맞춤 간병플랜";
    } else if (selectedProduct === '태아보험') {
        productName = "어린이Q";
    }
    
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const custName = currentCustomer.name;
    
    // 보험료 범위에 따른 금액 결정
    let premiums = ["95,400", "128,700", "156,200"];
    if (selectedPremium === '5만원이하') premiums = ["42,300", "38,100", "47,800"];
    else if (selectedPremium === '5~10만원') premiums = ["72,400", "85,600", "93,100"];
    else if (selectedPremium === '10~15만원') premiums = ["108,500", "125,300", "142,800"];
    else if (selectedPremium === '15만원초과') premiums = ["168,900", "185,200", "201,700"];
    
    const newPlans = [
        [currentCustomer.plans.length + 1, "고객 개인화 추천", "AI", custName, generatePlanId(), productName, dateStr, premiums[0], "17.5", "정상", ""],
        [currentCustomer.plans.length + 2, "베테랑 설계 따라하기", "AI", custName, generatePlanId(), productName, dateStr, premiums[1], "15.2", "정상", ""],
        [currentCustomer.plans.length + 3, "우리 지점 트렌드", "AI", custName, generatePlanId(), productName, dateStr, premiums[2], "13.8", "정상", ""]
    ];
    
    currentCustomer.plans.push(...newPlans);
    
    hideCustomDesignModal();
    
    showLoadingOverlay(() => {
        renderPlans(currentCustomer.plans);
        updateAiResultPopupCards(newPlans);
        showAiResultModal();
        
        const coverageText = selectedCoverages.length > 0 ? selectedCoverages.slice(0, 3).join(', ') + (selectedCoverages.length > 3 ? ' 외 ' + (selectedCoverages.length - 3) + '건' : '') : '기본';
        showAlert("맞춤 AI 설계 완료", `[${productName}] 기준\n보험료: ${selectedPremium}\n주요담보: ${coverageText}\n\n3개의 맞춤 설계안이 생성되었습니다.`);
    });
}

function showLoadingOverlay(callback) {
    const overlay = document.getElementById('ai-loading-overlay');
    const steps = [1,2,3,4,5,6].map(n => document.getElementById(`step-${n}`));
    
    // Reset all steps to default
    steps.forEach(s => {
        if(s) s.className = 'step-box';
    });
    
    if (!overlay) {
        if(callback) callback();
        return;
    }
    
    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);

    // Sequence timing: Animate through steps
    const stepDuration = 500; // ms per step
    steps.forEach((s, idx) => {
        setTimeout(() => {
            // Previous step becomes active (yellow)
            if (idx > 0) {
                steps[idx-1].className = 'step-box active';
            }
            // Current step becomes highlighted (orange)
            if (s) s.className = 'step-box highlight';
        }, idx * stepDuration);
    });

    setTimeout(() => {
        overlay.classList.remove('show');
        // Final state: all steps active except maybe the last one stays highlighted or all active
        steps.forEach(s => { if(s) s.className = 'step-box active'; });
        
        setTimeout(() => {
            overlay.style.display = 'none';
            if(callback) callback();
        }, 300);
    }, (steps.length * stepDuration) + 500);
}

function resetStepper() {
    const steps = document.querySelectorAll('.step-box');
    steps.forEach((step, index) => {
        step.className = 'step-box';
        if (index === 0) step.classList.add('active', 'highlight');
    });
}

function showPlanDetail(plan) {
    document.getElementById('pd-product-name').textContent = plan[5];
    document.getElementById('pd-plan-id').textContent = plan[4];
    document.getElementById('pd-premium').textContent = plan[7];
    document.getElementById('pd-audit-result').textContent = plan[9];
    
    const reasonType = plan[1];
    const titleEl = document.getElementById('pd-reason-title');
    const statEl = document.getElementById('pd-stat');
    const simEl = document.getElementById('pd-similarity');
    const prevSimEl = document.getElementById('pd-prev-sim');
    const descEl = document.querySelector('.pd-desc');
    
    // 태아보험/어린이보험 분기 처리
    const isPrenatal = plan[5].includes('어린이');

    if (isPrenatal) {
        document.getElementById('pd-sim-wrapper').style.display = 'none';
        document.getElementById('pd-prev-sim-wrapper').style.display = 'none';
        descEl.textContent = "고객님과 동일한 유형의 고객들이 가장 선호하는 표준 플랜 구성입니다.";
        
        if (reasonType === "고객 개인화 추천") {
            titleEl.textContent = "[설계 주제] 자사 최다 가입 표준 플랜";
            statEl.innerHTML = "당사 태아보험 가입 고객들이 <strong>가장 많이 선택하는</strong> 기본 표준 플랜입니다.";
        } else if (reasonType === "베테랑 설계 따라하기") {
            titleEl.textContent = "[설계 주제] 표준 플랜 + 우수 설계자 옵션";
            statEl.innerHTML = "표준 플랜에 <strong>우수 설계자들의 추천 특약</strong>이 추가된 든든한 구성입니다.";
        } else {
            titleEl.textContent = "[설계 주제] 표준 플랜 + 지점 인기 옵션";
            statEl.innerHTML = "표준 플랜에 최근 3개월 지점 내 <strong>가장 인기 있는 옵션</strong>이 추가된 구성입니다.";
        }
    } else {
        document.getElementById('pd-sim-wrapper').style.display = 'block';
        document.getElementById('pd-prev-sim-wrapper').style.display = 'block';
        descEl.textContent = "고객님의 가입정보를 기반 중 암/뇌/심 중증질환 기왕력 및 다빈도질환 이력이 비슷한 고객님들이 많이 가입한 상품 중 보장 자산이 많이 담긴 설계를 추천 드립니다.";

        if (reasonType === "고객 개인화 추천") {
            titleEl.textContent = "[설계 주제] 고객 맞춤 (유사고객)";
            statEl.innerHTML = "대장용종 병력을 가지고 있는 분들의 <strong>50.0%</strong>가 가입 중인 상품입니다.";
            simEl.textContent = "88.8%";
            prevSimEl.textContent = "75.4%";
        } else if (reasonType === "베테랑 설계 따라하기") {
            titleEl.textContent = "[설계 주제] 우수 설계 따라하기";
            statEl.innerHTML = "우수 플래너들이 가장 많이 설계한 <strong>Top 3</strong> 구성입니다.";
            simEl.textContent = "92.5%";
            prevSimEl.textContent = "81.2%";
        } else {
            titleEl.textContent = "[설계 주제] 최신 트렌드";
            statEl.innerHTML = "최근 3개월 지점 내 최다 판매를 기록한 <strong>인기 트렌드</strong> 상품입니다.";
            simEl.textContent = "85.2%";
            prevSimEl.textContent = "68.9%";
        }
    }
    
    document.getElementById('plan-detail-modal').classList.add('show');
}

function hidePlanDetailModal() {
    document.getElementById('plan-detail-modal').classList.remove('show');
}

function showAuditModal() {
    // If called from dashboard action bar (not from detail/result modal)
    const detailModal = document.getElementById('plan-detail-modal');
    const resultModal = document.getElementById('ai-result-modal');
    const isModalOpen = (detailModal && detailModal.classList.contains('show')) || (resultModal && resultModal.classList.contains('show'));

    if (!isModalOpen) {
        if (!window.selectedPlanIndices || window.selectedPlanIndices.length === 0) {
            showAlert("안내", "먼저 목록에서 설계를 선택해주세요.");
            return;
        }
    }

    // Try to get audit text from either detail modal or result modal
    const pdAudit = document.getElementById('pd-audit-result');
    let auditText = pdAudit ? pdAudit.textContent : "정상";
    
    if (resultModal && resultModal.classList.contains('show') && !document.getElementById('plan-detail-modal').classList.contains('show')) {
        // Mock: currently 4-1 always shows a default audit for demo
        auditText = "부담보"; 
    } else if (!isModalOpen) {
        // Dashboard context
        const plan = currentCustomer.plans[window.selectedPlanIndices[0]];
        auditText = plan[9];
    }
    
    if (auditText.trim() !== "정상") {
        document.getElementById('audit-dynamic-result').innerHTML = "직장(2년)<br>대장(맹장, 직장 제외)(2년)<br>상, 하악골(위턱뼈-아래턱뼈)(2년)";
    } else {
        document.getElementById('audit-dynamic-result').innerHTML = "정상 인수 대상입니다.";
    }
    
    document.getElementById('audit-modal').classList.add('show');
}

function hideAuditModal() {
    document.getElementById('audit-modal').classList.remove('show');
}

function showSimModal() {
    // Determine which modal is currently providing the plan info
    let planId, productName;
    const detailModal = document.getElementById('plan-detail-modal');
    const resultModal = document.getElementById('ai-result-modal');

    if (detailModal && detailModal.classList.contains('show')) {
        planId = document.getElementById('pd-plan-id').textContent;
        productName = document.getElementById('pd-product-name').textContent;
    } else if (resultModal && resultModal.classList.contains('show')) {
        planId = document.getElementById('detail-plan-id').textContent;
        productName = document.getElementById('detail-prod-name-span').textContent;
    } else {
        // Dashboard context
        if (!window.selectedPlanIndices || window.selectedPlanIndices.length === 0) {
            showAlert("안내", "먼저 목록에서 설계를 선택해주세요.");
            return;
        }
        const plan = currentCustomer.plans[window.selectedPlanIndices[0]];
        planId = plan[4];
        productName = plan[5];
    }

    const custName = currentCustomer ? currentCustomer.name : '고객명';

    document.getElementById('sim-cust-name').value = custName;
    document.getElementById('sim-plan-id').textContent = planId;
    document.getElementById('sim-product-name').textContent = productName;
    
    document.querySelectorAll('.sim-plan-id-display').forEach(el => {
        el.textContent = planId.substring(0, 10) + (planId.length > 10 ? '...' : '');
    });

    document.getElementById('sim-modal').classList.add('show');
}

function hideSimModal() {
    document.getElementById('sim-modal').classList.remove('show');
}

function showCompareModal() {
    let plans = [];
    const isDashboard = !document.getElementById('ai-result-modal').classList.contains('show');

    if (isDashboard) {
        if (!window.selectedPlanIndices || window.selectedPlanIndices.length < 2) {
            showAlert("안내", "비교할 플랜을 2개 이상 선택해주세요. (최대 5개)");
            return;
        }
        plans = window.selectedPlanIndices.map(idx => currentCustomer.plans[idx]);
    } else {
        if (!currentCustomer || !currentCustomer.plans || currentCustomer.plans.length === 0) {
            showAlert("안내", "AI 설계 결과가 없습니다. 먼저 AI 설계를 진행해주세요.");
            return;
        }
        plans = currentCustomer.plans;
    }

    const thead = document.getElementById('compare-thead');
    const tbody = document.getElementById('compare-tbody');

    // Build thead
    let trHead = `<tr><th style="width:${100/(plans.length+1)}%;">구분 (담보명)</th>`;
    plans.forEach((plan, idx) => {
        const planId = plan[4];
        const productName = plan[5];
        trHead += `
            <th style="width:${100/(plans.length+1)}%;">
                <div class="plan-header">
                    <span class="plan-name">${productName}</span>
                    <span class="plan-id">${planId}</span>
                </div>
            </th>
        `;
    });
    trHead += '</tr>';
    thead.innerHTML = trHead;

    // Generate mock coverages for comparison
    const coverages = [
        { name: "일반암진단비(유사암제외)", baseAmounts: ["5,000만원", "5,000만원", "3,000만원"] },
        { name: "유사암진단비", baseAmounts: ["1,000만원", "1,000만원", "600만원"] },
        { name: "뇌혈관질환진단비", baseAmounts: ["2,000만원", "1,000만원", "2,000만원"] },
        { name: "허혈심장질환진단비", baseAmounts: ["2,000만원", "1,000만원", "2,000만원"] },
        { name: "질병수술비(모든질병)", baseAmounts: ["50만원", "30만원", "50만원"] },
        { name: "상해수술비", baseAmounts: ["100만원", "50만원", "100만원"] },
        { name: "질병후유장해(3~100%)", baseAmounts: ["1,000만원", "미가입", "1,000만원"] },
        { name: "상해후유장해(3~100%)", baseAmounts: ["1억원", "5,000만원", "1억원"] },
        { name: "가족일상생활배상책임", baseAmounts: ["1억원", "1억원", "1억원"] }
    ];

    // Build tbody
    tbody.innerHTML = '';
    coverages.forEach(cov => {
        const tr = document.createElement('tr');
        let html = `<td class="coverage-name">${cov.name}</td>`;
        plans.forEach((plan, idx) => {
            const amount = cov.baseAmounts[idx] || "-";
            html += `<td class="amount">${amount}</td>`;
        });
        tr.innerHTML = html;
        tbody.appendChild(tr);
    });

    document.getElementById('compare-modal').classList.add('show');
}

function hideCompareModal() {
    document.getElementById('compare-modal').classList.remove('show');
}

function hideSimModal() {
    document.getElementById('sim-modal').classList.remove('show');
}

function showContractDetailModal(company) {
    document.getElementById('cd-company-name').textContent = company;
    const listContainer = document.getElementById('cd-contract-list');
    listContainer.innerHTML = '';

    // Mock data generators
    const mockData = {
        "현대해상": [
            { name: "무배당 퍼펙트플러스종합보험", status: "유지", coverages: ["일반상해후유장해", "암진단비(유사암제외)", "뇌혈관질환진단비", "질병수술비"] },
            { name: "무배당 굿앤굿어린이종합보험Q", status: "유지", coverages: ["골절진단비", "상해입원일당", "질병입원일당", "가족일상생활배상책임"] },
            { name: "무배당 뉴하이카운전자상해보험", status: "유지", coverages: ["자동차사고벌금", "교통사고처리지원금", "변호사선임비용"] }
        ],
        "손해보험": [
            { name: "무배당 프로미라이프 건강보험", status: "유지", coverages: ["암진단비", "유사암진단비", "항암방사선약물치료비"] },
            { name: "무배당 다이렉트 운전자보험", status: "유지", coverages: ["자동차사고부상치료비", "운전자벌금"] }
        ],
        "생명보험": [
            { name: "무배당 프리미엄 종신보험", status: "유지", coverages: ["일반사망", "재해사망"] },
            { name: "무배당 변액연금보험", status: "유지", coverages: ["연금지급개시후 연금", "재해장해급여금"] },
            { name: "(무) 다이렉트 암보험", status: "유지", coverages: ["고액암진단자금", "암수술급여금"] },
            { name: "(무) 정기보험", status: "유지", coverages: ["사망보험금"] },
            { name: "(무) 치아보험", status: "유지", coverages: ["임플란트치료자금", "크라운치료자금"] }
        ],
        "기타": [
            { name: "우체국 안전벨트보험", status: "유지", coverages: ["교통재해사망", "교통재해입원"] }
        ]
    };

    const contracts = mockData[company] || [];

    if (contracts.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">가입 내역이 없습니다.</p>';
    } else {
        contracts.forEach(contract => {
            const card = document.createElement('div');
            card.className = 'contract-card';
            
            const coveragesHtml = contract.coverages.map(cov => `<span class="coverage-tag">${cov}</span>`).join('');
            
            card.innerHTML = `
                <div class="contract-card-header">
                    <span class="product-name">${contract.name}</span>
                    <span class="status">${contract.status}</span>
                </div>
                <div class="contract-card-info">
                    <span>가입일자: 202${Math.floor(Math.random() * 4) + 1}-0${Math.floor(Math.random() * 9) + 1}-15</span>
                    <span>증권번호: L0${Math.floor(Math.random() * 9000000) + 1000000}</span>
                </div>
                <div class="contract-card-coverages">
                    ${coveragesHtml}
                </div>
            `;
            listContainer.appendChild(card);
        });
    }

    document.getElementById('contract-detail-modal').classList.add('show');
}

function hideContractDetailModal() {
    document.getElementById('contract-detail-modal').classList.remove('show');
}

function showAiSpecsModal() {
    const tbody = document.getElementById('ai-specs-tbody');
    tbody.innerHTML = '';
    
    const mockData = [
        { isHighlighted: true, type: "AI", no: 1, name: "김현대", theme: "유사고객플랜", id: "L026 11379888", prod: "굿앤굿스타종합보험(hi2603)", date: "2026-03-24", premium: "81,780", mult: "32.7", period: "20260324~20460324", result: "할증", memo: "" },
        { isHighlighted: true, type: "AI", no: 2, name: "김현대", theme: "FM팀장플랜", id: "L026 11376101", prod: "굿앤굿스타종합보험(hi2603)", date: "2026-03-24", premium: "100,230", mult: "25.4", period: "20260324~20460324", result: "할증", memo: "", memoStyle: "background: #ffe0b2;" },
        { isHighlighted: false, type: "AI", no: 3, name: "홍해상", theme: "유사고객플랜", id: "L026 11762154", prod: "굿앤굿스타종합보험(hi2603)", date: "2026-03-25", premium: "291,780", mult: "17.7", period: "20260325~20460325", result: "부담보", memo: "" },
        { isHighlighted: false, type: "AI", no: 4, name: "홍해상", theme: "FM팀장플랜", id: "L026 11761675", prod: "굿앤굿스타종합보험(hi2603)", date: "2026-03-25", premium: "232,030", mult: "16.7", period: "20260325~20460325", result: "부담보", memo: "" },
        { isHighlighted: false, type: "AI", no: 5, name: "홍해상", theme: "최신트렌드플랜", id: "L026 11761298", prod: "굿앤굿스타종합보험(hi2603)", date: "2026-03-25", premium: "233,640", mult: "16.6", period: "20260325~20460325", result: "", memo: "누적조정..." },
        { isHighlighted: false, type: "AI", no: 6, name: "김화재", theme: "유사고객플랜", id: "L026 10034717", prod: "간편한3.10.10건강보험", date: "2026-03-13", premium: "487,500", mult: "13.6", period: "20260313~20460313", result: "", memo: "누적조정..." },
        { isHighlighted: false, type: "AI", no: 7, name: "김화재", theme: "FM팀장플랜", id: "L026 10009834", prod: "간편한3.10.10건강보험", date: "2026-03-13", premium: "487,500", mult: "14.7", period: "20260313~20460313", result: "", memo: "누적조정..." },
        { isHighlighted: false, type: "AI", no: 8, name: "김화재", theme: "최신트렌드플랜", id: "L026 10009200", prod: "간편한3.10.10건강보험", date: "2026-03-13", premium: "487,500", mult: "14.9", period: "20260313~20460313", result: "", memo: "" },
        { isHighlighted: false, type: "AI", no: 9, name: "김화재", theme: "유사고객플랜", id: "L026 10002795", prod: "간편한3.10.10건강보험", date: "2026-03-13", premium: "43,020", mult: "18.8", period: "20260313~20460313", result: "", memo: "" },
        { isHighlighted: false, type: "AI", no: 10, name: "김보험", theme: "FM팀장플랜", id: "L026 12133179", prod: "퍼펙트플러스종합보험", date: "2026-03-27", premium: "83,770", mult: "14.3", period: "20260327~20460327", result: "", memo: "" },
        { isHighlighted: false, type: "AI", no: 11, name: "김보험", theme: "최신트렌드플랜", id: "L026 12120855", prod: "퍼펙트플러스종합보험", date: "2026-03-27", premium: "187,400", mult: "13.9", period: "20260327~20460327", result: "부담보", memo: "" },
        { isHighlighted: false, type: "AI", no: 12, name: "김보험", theme: "유사고객플랜", id: "L026 12109517", prod: "퍼펙트플러스종합보험", date: "2026-03-27", premium: "128,560", mult: "16.1", period: "20260327~20460327", result: "", memo: "" },
        { isHighlighted: false, type: "AI", no: 13, name: "김보험", theme: "FM팀장플랜", id: "L026 12384035", prod: "퍼펙트플러스종합보험", date: "2026-03-30", premium: "201,710", mult: "14.8", period: "20260331~20460331", result: "부담보", memo: "" },
        { isHighlighted: false, type: "AI", no: 14, name: "김보험", theme: "최신트렌드플랜", id: "L026 12271575", prod: "퍼펙트플러스종합보험", date: "2026-03-30", premium: "183,360", mult: "14.9", period: "20260330~20460330", result: "부담보", memo: "" }
    ];

    mockData.forEach(item => {
        const tr = document.createElement('tr');
        if (item.isHighlighted) tr.className = 'highlight-row';
        
        tr.innerHTML = `
            <td><input type="checkbox" style="width: 12px; height: 12px; margin: 0;"></td>
            <td>${item.type}</td>
            <td>${item.no}</td>
            <td>${item.name}</td>
            <td>${item.theme}</td>
            <td>${item.id}</td>
            <td class="text-left" style="max-width: 160px; overflow: hidden; text-overflow: ellipsis;">${item.prod}</td>
            <td>${item.date}</td>
            <td style="text-align: right; padding-right: 8px;">${item.premium}</td>
            <td>${item.mult}</td>
            <td>${item.period}</td>
            <td>${item.result}</td>
            <td style="${item.memoStyle || ''}; font-weight: ${item.memo ? 'bold' : 'normal'};">${item.memo}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('ai-specs-modal').classList.add('show');
}

function hideAiSpecsModal() {
    document.getElementById('ai-specs-modal').classList.remove('show');
}

function showMyPlanModal() {
    const tbody = document.getElementById('my-plan-tbody');
    tbody.innerHTML = '';
    
    const mockData = [
        { prod: "굿앤굿스타종합보험(hi2603)", id: "L026 11379888", contractor: "김현대", insured: "김현대", silson: "예정", silson2: "☑", period: "20년납/100세만기", status: "확정요청", premium: "81,780", mult: "32.7", scan: "☑", wanpan: "☑", sign: "☑", recruit: "☑" },
        { prod: "굿앤굿스타종합보험(hi2603)", id: "L026 11376101", contractor: "김현대", insured: "김현대", silson: "예정", silson2: "☑", period: "20년납/100세만기", status: "심사중", premium: "100,230", mult: "25.4", scan: "☑", wanpan: "☑", sign: "☑", recruit: "☑" },
        { prod: "퍼펙트플러스종합보험", id: "L026 12133179", contractor: "이연희", insured: "이연희", silson: "-", silson2: "☐", period: "20년납/100세만기", status: "가입설계", premium: "83,770", mult: "14.3", scan: "☐", wanpan: "☐", sign: "☐", recruit: "☐" },
        { prod: "간편한3.10.10건강보험", id: "L026 10034717", contractor: "홍해상", insured: "홍해상", silson: "-", silson2: "☐", period: "20년납/90세만기", status: "확정대상", premium: "487,500", mult: "13.6", scan: "☑", wanpan: "☑", sign: "☐", recruit: "☑" }
    ];

    mockData.forEach(item => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.onclick = () => {
            tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected-row'));
            tr.classList.add('selected-row');
            const checkbox = tr.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = true;
            window.selectedImportPlan = item;
        };
        tr.innerHTML = `
            <td><input type="checkbox"></td>
            <td class="text-left">${item.prod}</td>
            <td>${item.id}</td>
            <td>${item.contractor}</td>
            <td>${item.insured}</td>
            <td>${item.silson}</td>
            <td>${item.silson2}</td>
            <td>${item.period}</td>
            <td>${item.status}</td>
            <td style="text-align: right; padding-right: 8px;">${item.premium}</td>
            <td>${item.mult}</td>
            <td>${item.scan}</td>
            <td>${item.wanpan}</td>
            <td>${item.sign}</td>
            <td>${item.recruit}</td>
        `;
        tbody.appendChild(tr);
    });

    window.selectedImportPlan = null;
    document.getElementById('my-plan-modal').classList.add('show');
}

function handleImportAiRequest() {
    if (!window.selectedImportPlan) {
        showAlert("안내", "먼저 목록에서 설계안을 선택해주세요.");
        return;
    }

    const item = window.selectedImportPlan;
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    
    // Create new plan based on selection
    const newPlan = [currentCustomer.plans.length + 1, "내 설계 불러오기", "AI", currentCustomer.name, generatePlanId(), item.prod, dateStr, item.premium, "100", "정상", ""];
    
    currentCustomer.plans.push(newPlan);
    
    hideMyPlanModal();
    
    showLoadingOverlay(() => {
        renderPlans(currentCustomer.plans);
        showAlert("불러오기 완료", `[${item.prod}] 설계가 목록에 추가되었습니다.`);
    });
}

function hideMyPlanModal() {
    document.getElementById('my-plan-modal').classList.remove('show');
}

function showRecommendedPlanModal() {
    const tbody = document.getElementById('recommended-plan-tbody');
    tbody.innerHTML = '';
    
    const mockData = [
        { prod: "퍼펙트플러스종합보험", id: "L026 88721092", designer: "장베테랑", theme: "지점장추천", insured: "김현대", period: "20년납/100세만기", premium: "125,000", reason: "지점 내 우수 설계 사례로 선정된 최적화 플랜" },
        { prod: "간편한3.10.10건강보험", id: "L026 77612093", designer: "이우수", theme: "지역단추천", insured: "김현대", period: "20년납/90세만기", premium: "98,000", reason: "지역단 내 유병자 상품 판매 활성화 우수 플랜" },
        { prod: "굿앤굿스타종합보험(hi2603)", id: "L026 99012345", designer: "박지점", theme: "본사추천", insured: "김현대", period: "20년납/100세만기", premium: "110,200", reason: "본사 상품전략파트 추천 표준 가이드 플랜" },
        { prod: "뉴하이카운전자보험", id: "L026 55432109", designer: "최관리", theme: "지점장추천", insured: "김현대", period: "20년납/20년만기", premium: "25,000", reason: "운전자 필수 담보 중심의 지점장 추천 플랜" }
    ];

    mockData.forEach(item => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.onclick = () => {
            tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected-row'));
            tr.classList.add('selected-row');
            const checkbox = tr.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = true;
            window.selectedRecommendedPlan = item;
        };
        tr.innerHTML = `
            <td><input type="checkbox"></td>
            <td class="text-left">${item.prod}</td>
            <td>${item.id}</td>
            <td>${item.designer}</td>
            <td><span style="background: #fff3e0; color: #e65c00; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${item.theme}</span></td>
            <td>${item.insured}</td>
            <td>${item.period}</td>
            <td style="text-align: right; padding-right: 8px;">${item.premium}</td>
            <td>22.4</td>
            <td class="text-left" style="color: #666;">${item.reason}</td>
        `;
        tbody.appendChild(tr);
    });

    window.selectedRecommendedPlan = null;
    document.getElementById('recommended-plan-modal').classList.add('show');
}

function handleRecommendedAiRequest() {
    if (!window.selectedRecommendedPlan) {
        showAlert("안내", "먼저 목록에서 설계안을 선택해주세요.");
        return;
    }

    const item = window.selectedRecommendedPlan;
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    
    // Create new plan based on selection
    const newPlan = [currentCustomer.plans.length + 1, "추천설계 불러오기", "AI", currentCustomer.name, generatePlanId(), item.prod, dateStr, item.premium, "100", "정상", ""];
    
    currentCustomer.plans.push(newPlan);
    
    hideRecommendedPlanModal();
    
    showLoadingOverlay(() => {
        renderPlans(currentCustomer.plans);
        showAlert("불러오기 완료", `[${item.prod}] 설계가 목록에 추가되었습니다.`);
    });
}

function hideRecommendedPlanModal() {
    document.getElementById('recommended-plan-modal').classList.remove('show');
}

// AI 설계 결과 상세 팝업
function showAiResultModal() {
    // 1번 탭 초기화
    switchResultTab(1);
    document.getElementById('ai-result-modal').classList.add('show');
}

function hideAiResultModal() {
    document.getElementById('ai-result-modal').classList.remove('show');
}

function updateAiResultPopupCards(plans) {
    plans.forEach((plan, idx) => {
        const tabNum = idx + 1;
        const card = document.getElementById(`plan-option-${tabNum}`);
        if (!card) return;

        const nameEl = card.querySelector('.p-name');
        const idEl = card.querySelector('.p-meta:nth-child(2)');
        const totalEl = card.querySelector('.p-total');
        const analysisEl = card.querySelector('.p-analysis');

        if (nameEl) nameEl.innerText = plan[5]; // productName
        if (idEl) idEl.innerText = `설계번호 : ${plan[4]}`; // planId
        if (totalEl) totalEl.innerText = `[ 합계보험료 ] ${plan[7]} 원`; // premium
        if (analysisEl) {
            const theme = plan[1];
            const score = plan[8];
            analysisEl.innerText = `${theme} 분석 결과 : 유사도 ${score}% / 주요담보 : XX, XX`;
        }
    });
}

function switchResultTab(tabNum) {
    // 카드 활성화 상태 업데이트
    document.querySelectorAll('.plan-result-card').forEach(card => card.classList.remove('active'));
    document.getElementById(`plan-option-${tabNum}`).classList.add('active');

    // 상세 내용 업데이트 (Mock)
    const prodNameSpan = document.getElementById('detail-prod-name-span');
    const planIdSpan = document.getElementById('detail-plan-id');
    const premiumSpan = document.getElementById('detail-premium');
    const tbody = document.getElementById('detail-coverage-tbody');

    if (currentCustomer && currentCustomer.plans && currentCustomer.plans.length >= tabNum) {
        const plan = currentCustomer.plans[tabNum - 1];
        prodNameSpan.innerText = plan[5];
        planIdSpan.innerText = plan[4];
        premiumSpan.innerText = plan[7];
    } else {
        if (tabNum === 1) {
            prodNameSpan.innerText = "간편한3.10.10건강보험(세만기형)(Hi2601)(간편건강고지)";
            planIdSpan.innerText = "L026 08701817";
            premiumSpan.innerText = "150,000";
        } else if (tabNum === 2) {
            prodNameSpan.innerText = "내삶엔(3N)맞춤건강보험(세만기형)(Hi2601)1종(표준형)";
            planIdSpan.innerText = "L026 10815948";
            premiumSpan.innerText = "100,000";
        } else {
            prodNameSpan.innerText = "내삶엔(3N)맞춤건강보험(세만기형)(Hi2601)2종(해약환급금미지급형)";
            planIdSpan.innerText = "L026 11250053";
            premiumSpan.innerText = "70,000";
        }
    }

    // 담보 상세 데이터 생성
    const coverages = [
        ["001", "기본계약(상해사망후유장해)", "30년납100세만기", "10,000", "5,580"],
        ["002", "보험료납입면제대상", "전기납30년만기", "10", "101"],
        ["003", "보험료납입지원(유사암진단)", "전기납30년만기", "144,375", "10,221"],
        ["009", "골절진단", "30년납100세만기", "20", "2,914"],
        ["011", "골절진단(치아파절제외)", "30년납100세만기", "30", "2,109"],
        ["013", "골절(치아파절제외)부목치료", "30년납100세만기", "5", "84"],
        ["015", "5대골절진단", "30년납100세만기", "200", "2,180"],
        ["016", "화상진단", "30년납100세만기", "50", "759"],
        ["018", "중증화상/부식진단", "30년납100세만기", "5,000", "105"],
        ["023", "상해입원일당(1-180일)", "30년납100세만기", "3", "4,995"],
        ["028", "상해입원일당(1-30일,종합병원,1인실)", "30년납100세만기", "4", "28"],
        ["029", "상해입원일당(1-30일,상급종합병원,1인실)", "30년납100세만기", "30", "42"],
        ["030", "상해입원일당(1-30일,종합병원,2~3인실)", "30년납100세만기", "2", "148"],
        ["032", "상해입원일당(1-30일,상급종합병원,2~3인실)", "30년납100세만기", "7", "77"],
        ["035", "상해입원일당(1-180일,중환자실)", "30년납100세만기", "10", "650"],
        ["043", "상해외과수술(당일입원제외)", "30년납100세만기", "100", "2,320"],
        ["044", "상해통원수술(당일입원포함)", "30년납100세만기", "100", "2,450"],
        ["051", "상해수술III(1-5종)(수술회당지급)(1종)", "30년납100세만기", "20", "490"]
    ];

    tbody.innerHTML = '';
    coverages.forEach(cov => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cov[0]}</td>
            <td class="text-left">${cov[1]}</td>
            <td>${cov[2]}</td>
            <td style="text-align: right; padding-right: 15px;">${cov[3]}</td>
            <td style="text-align: right; padding-right: 15px;">${cov[4]}</td>
        `;
        tbody.appendChild(tr);
    });
}

function showPlanDetailByTab(tabNum) {
    if (currentCustomer && currentCustomer.plans && currentCustomer.plans[tabNum - 1]) {
        showPlanDetail(currentCustomer.plans[tabNum - 1]);
    }
}

function showNewCustomerModal() {
    document.getElementById('new-customer-modal').classList.add('show');
}

function hideNewCustomerModal() {
    document.getElementById('new-customer-modal').classList.remove('show');
}

function showConsentModal() {
    document.getElementById('consent-modal').classList.add('show');
}

function hideConsentModal() {
    document.getElementById('consent-modal').classList.remove('show');
}

function showPrintModal() {
    document.getElementById('print-modal').classList.add('show');
}

function hidePrintModal() {
    document.getElementById('print-modal').classList.remove('show');
}

// ===== Memo Feature =====
let memoTargetPlanIndex = null;

function showMemoModal() {
    if (!window.selectedPlanIndices || window.selectedPlanIndices.length === 0) {
        showAlert("안내", "먼저 목록에서 설계를 선택해주세요.");
        return;
    }
    if (window.selectedPlanIndices.length > 1) {
        showAlert("안내", "메모는 한 건씩 작성할 수 있습니다. 하나만 선택해주세요.");
        return;
    }
    openMemoForPlan(window.selectedPlanIndices[0]);
}

function openMemoForPlan(planIdx) {
    if (!currentCustomer || !currentCustomer.plans || !currentCustomer.plans[planIdx]) return;
    
    memoTargetPlanIndex = planIdx;
    const plan = currentCustomer.plans[planIdx];
    
    document.getElementById('memo-plan-id').textContent = plan[4];
    document.getElementById('memo-product-name').textContent = plan[5];
    document.getElementById('memo-reason').textContent = plan[1];
    
    const textarea = document.getElementById('memo-text');
    textarea.value = plan[10] || '';
    document.getElementById('memo-char-current').textContent = textarea.value.length;
    
    document.getElementById('memo-modal').classList.add('show');
    setTimeout(() => textarea.focus(), 100);
}

function hideMemoModal() {
    document.getElementById('memo-modal').classList.remove('show');
    memoTargetPlanIndex = null;
}

function saveMemo() {
    if (memoTargetPlanIndex === null || !currentCustomer || !currentCustomer.plans[memoTargetPlanIndex]) return;
    
    const memoText = document.getElementById('memo-text').value.trim();
    currentCustomer.plans[memoTargetPlanIndex][10] = memoText;
    
    renderPlans(currentCustomer.plans);
    hideMemoModal();
    showAlert("저장 완료", "메모가 저장되었습니다.");
}
