(() => {
  const ANSWERS = [
    { key: 'yes', t: 'ある・している' },
    { key: 'no', t: 'ない・していない' },
    { key: 'unknown', t: '未確認' },
    { key: 'na', t: '該当なし' }
  ];

  const RISK_CONFIG = {
    0: { label: '大きな問題は見えにくい', shortLabel: '確認済', color: '#15803D', cls: 'lv0', barPct: 10 },
    1: { label: '資料確認が必要', shortLabel: '要確認', color: '#2563EB', cls: 'lv1', barPct: 40 },
    2: { label: '運用の見直しを検討', shortLabel: '見直し', color: '#D97706', cls: 'lv2', barPct: 70 },
    3: { label: '優先して確認・見直し', shortLabel: '優先確認', color: '#C2410C', cls: 'lv3', barPct: 100 }
  };

  const AXIS_LABELS = {
    membership: '入会手続',
    privacy: '個人情報',
    finance: '会費・会計',
    personnel: '学校関与',
    facilities: '施設・配布',
    governance: '役員選出'
  };

  const AXIS_ICONS = {
    membership: '📋',
    privacy: '🔒',
    finance: '💰',
    personnel: '👩‍🏫',
    facilities: '🏫',
    governance: '🗳️'
  };

  const ROLE_LABELS = {
    parent: '保護者',
    officer: 'PTA役員',
    school: '学校・教育委員会'
  };

  const MODE_ALIASES = {
    parent: 'parent',
    parents: 'parent',
    guardian: 'parent',
    officer: 'officer',
    officers: 'officer',
    'pta-officer': 'officer',
    pta: 'officer',
    board: 'school',
    school: 'school',
    schools: 'school',
    'education-board': 'school',
    'school-board': 'school',
    admin: 'school'
  };

  const ROLE_CONFIG = {
    parent: {
      documents: ['PTA入会案内', 'PTA入会申込書', 'PTA退会届', '学校徴収金案内', '口座振替案内', '役員希望調査票', '免除申請書', '個人情報同意書', '学校アプリ配信画面', 'PTA会則', '配布封筒、提出先の記載'],
      actions: ['配布文書を捨てずに保存する。', '表面、裏面、封筒、配信画面、提出先を保存する。', '入会申込書があるか確認する。', '会費の請求主体と引落方法を確認する。', '個人情報同意の範囲を確認する。', '不安があれば、学校・PTA・教育委員会に文書で確認する。'],
      contacts: ['PTA会長・PTA役員', '学校長', '副校長・教頭', '学校事務', '教育委員会', '必要に応じて個人情報保護担当部署'],
      questions: ['PTA入会申込書はありますか。', 'PTAに加入していない場合、会費は請求されますか。', 'PTA会費は学校徴収金と分けて管理されていますか。', 'PTA書類の提出先が担任・学校になっている理由は何ですか。', '学校が保有する児童・保護者情報をPTA目的で自ら利用し、又はPTAへ提供していますか。', 'PTAに加入しない場合、子どもの学校生活上の取扱いに違いはありますか。'],
      links: [
        { label: '保護者向けガイド', url: '../guide-parent.html' },
        { label: '現場実例', url: '../compliance.html' },
        { label: '実物文書の見方', url: '../national-archive.html' },
        { label: '会費徴収', url: '../fee-collection.html' },
        { label: '個人情報', url: '../privacy.html' }
      ],
      note: '「任意」と書かれていても、全員提出・担任提出・学校提出・児童経由提出になっている場合、非加入意思や家庭の判断が学校・PTAに把握されやすくなります。加入を希望する人だけがPTAへ直接申し込む形式になっているかを確認してください。'
    },
    officer: {
      documents: ['PTA会則', '入会申込書', '退会届', '会員台帳', '会員名簿の作成根拠', '個人情報取扱規程', '会費徴収方法の資料', 'PTA名義口座資料', '学校徴収金との関係資料', '役員選出資料', '免除申請書', '総会資料', '予算書・決算書', '学校との覚書・依頼文', '学校アプリ利用関係資料'],
      actions: ['入会申込書と会員台帳を確認する。', '会員名簿の情報取得元を確認する。', '学校名簿を使っていないか確認する。', 'PTA会費の徴収方法を学校徴収金から分離する。', '学校職員が担っているPTA事務を棚卸しする。', '役員選出・免除申請の仕組みを見直す。', '会則と実務の不一致を確認する。', '次回役員会の議題にする。'],
      contacts: ['PTA役員会', 'PTA会計担当', 'PTA個人情報担当', '学校長', '副校長・教頭', '学校事務', '教育委員会', '必要に応じて専門家'],
      questions: ['現在の会員名簿は、誰が、どの情報をもとに作成していますか。', '入会申込書と会員台帳は対応していますか。', 'PTA会費の請求対象は、会員台帳と一致していますか。', '学校名簿やクラス名簿をPTA会員管理に使っていませんか。', '学校職員が担っているPTA事務は何ですか。', '役員選出の免除申請で家庭事情を集めていませんか。'],
      links: [
        { label: 'PTA役員向けガイド', url: '../guide-pta.html' },
        { label: '入会手続', url: '../membership.html' },
        { label: '会費徴収', url: '../fee-collection.html' },
        { label: '個人情報', url: '../privacy.html' },
        { label: '教職員関与', url: '../personnel.html' },
        { label: '現場実例', url: '../compliance.html' }
      ],
      note: '会則に任意加入や退会自由が書かれていても、実際の運用が一致していなければ、保護者から見て任意性が伝わりません。特に重要なのは、入会申込書、退会届、会員台帳、会費請求、名簿管理が一体として説明できることです。'
    },
    school: {
      documents: ['PTA文書配布・回収に関する記録', '学校徴収金案内', '学校徴収金システムの対象費目', 'PTA会費徴収に関する委任・覚書', '個人情報利用・提供記録', '学校名簿・クラス名簿の利用・提供記録', '校務分掌表', '職専免記録', '兼職承認記録', '学校連絡アプリ利用基準', '施設利用許可', '印刷機利用記録', '教育委員会通知', '校長会資料', '苦情・相談記録'],
      actions: ['学校がPTA文書を配布・回収している実態を確認する。', 'PTA会費を学校徴収金と一緒に扱っていないか確認する。', '学校保有情報のPTA目的利用とPTAへの提供実態を分けて確認する。', '教職員がPTA固有事務を担っていないか確認する。', '学校連絡ツール・施設・印刷機のPTA利用を確認する。', '学校向け通知・点検基準を整備する。', 'PTA自身が会員管理・会費徴収を行えるよう、学校関与の範囲を整理する。'],
      contacts: ['学校長', '副校長・教頭', '学校事務', '教育委員会担当課', '個人情報保護担当', '学校徴収金担当', '教職員服務担当', '施設管理担当'],
      questions: ['学校がPTA文書を配布・回収している実態はありますか。', 'PTA会費を学校徴収金に含めている学校はありますか。', '学校保有情報をPTA目的で自ら利用し、又はPTAへ提供している実態はありますか。', 'PTA名簿作成に学校名簿・クラス名簿が使われていますか。', '教職員がPTA固有事務を勤務時間内に行っていますか。', '学校連絡アプリをPTA連絡に利用していますか。', '教育委員会として学校向けのPTA運営適正化通知はありますか。'],
      links: [
        { label: '学校・教育委員会向け', url: '../guide-board.html' },
        { label: '会費徴収', url: '../fee-collection.html' },
        { label: '個人情報', url: '../privacy.html' },
        { label: '教職員関与', url: '../personnel.html' },
        { label: '施設利用', url: '../facilities.html' },
        { label: '現場実例', url: '../compliance.html' }
      ],
      note: 'PTA関係事務を学校職員が行う場合は、具体的作業を分け、校務・職務命令・職専免・兼職兼業のどの整理によるのか、個人情報、費用、決裁、責任主体とともに確認します。PTAから依頼されたという事実だけでは、学校側の職務上の根拠にはなりません。'
    }
  };

  function makeCheck(config) {
    const severity = config.severity ?? 2;
    const riskOn = config.riskOn || 'yes';
    const unknownLevel = config.unknownLevel ?? Math.min(2, Math.max(1, severity - 1));
    const okText = config.ok || '現時点では、この項目について大きな問題は見えにくい回答です。関連する文書や記録は引き続き保存してください。';
    const riskText = config.advice || 'この運用は、任意性、情報管理、公私分離の観点で問題となり得ます。根拠資料を確認してください。';
    const unknownText = config.unknown || '未確認の項目です。判断を急がず、まず文書・記録・担当者を確認してください。';
    const naText = config.na || '該当しない場合でも、同様の運用が始まったときに備えて確認先を整理しておくと安心です。';
    const opts = ANSWERS.map((answer) => {
      if (answer.key === 'yes') {
        const risky = riskOn === 'yes';
        return {
          ...answer,
          level: risky ? severity : 0,
          adv: risky ? riskText : okText,
          risk: risky ? config.risk : null,
          links: config.links || [],
          laws: config.laws || []
        };
      }
      if (answer.key === 'no') {
        const risky = riskOn === 'no';
        return {
          ...answer,
          level: risky ? severity : 0,
          adv: risky ? riskText : okText,
          risk: risky ? config.risk : null,
          links: config.links || [],
          laws: config.laws || []
        };
      }
      if (answer.key === 'unknown') {
        return {
          ...answer,
          level: unknownLevel,
          adv: unknownText,
          risk: `${config.cat}の確認未了`,
          links: config.links || [],
          laws: config.laws || []
        };
      }
      return { ...answer, level: 0, adv: naText, risk: null, links: config.links || [], laws: config.laws || [] };
    });
    return { ...config, axisIcon: AXIS_ICONS[config.axis] || '•', opts };
  }

  const AUDIT_DB = {
    parent: [
      makeCheck({ cat: '入会申込', axis: 'membership', q: 'PTA入会申込書がありますか。', riskOn: 'no', severity: 2, risk: '入会申込記録の不足', advice: '入会申込書が見当たらない場合、会員扱いや会費請求の根拠確認が必要です。', links: [{ label: '入会手続', url: '../membership.html' }] }),
      makeCheck({ cat: 'みなし加入', axis: 'membership', q: '入学・在籍と同時にPTA加入扱いになる説明がありますか。', severity: 3, risk: 'みなし加入・自動加入', advice: '入学や在籍だけでPTA会員扱いにする説明は、保護者本人の入会意思を確認していない可能性があります。', links: [{ label: '現場実例', url: '../compliance.html#case01' }] }),
      makeCheck({ cat: '非提出で加入', axis: 'membership', q: '提出しない場合に加入扱いになる文言がありますか。', severity: 3, risk: 'みなし加入・自動加入', advice: '提出しないことを加入意思と扱う方式は、入会を希望する人だけが申し込む形式になっているか確認が必要です。', links: [{ label: '入会手続', url: '../membership.html' }] }),
      makeCheck({ cat: '全員提出', axis: 'membership', q: 'PTA加入について「入る・入らない」を選ぶ形式なのに、全家庭に提出を求める文書がありますか。', severity: 2, risk: '任意加入と全員提出の混在', advice: '任意と説明しながら全家庭に提出を求めると、非加入意思が学校やPTAに把握されやすくなります。提出範囲と提出先を確認してください。' }),
      makeCheck({ cat: '学校提出', axis: 'personnel', q: '「任意」と書かれている一方で、提出先が担任・学校・副校長などになっていますか。', severity: 2, risk: '学校経由提出・担任回収', advice: 'PTAの任意手続を学校へ提出させる運用は、学校手続との混同につながります。PTAへ直接申し込む形式か確認してください。', links: [{ label: '学校経由事務', url: '../compliance.html#case06' }] }),
      makeCheck({ cat: '会費徴収', axis: 'finance', q: 'PTA会費が学校徴収金と一緒に引き落とされていますか。', severity: 3, risk: '学校徴収金とPTA会費の混在', advice: 'PTA会費と学校徴収金が同じ通知や引落で扱われると、任意団体の会費であることが分かりにくくなります。請求主体と会員確認を確認してください。', links: [{ label: '会費徴収', url: '../fee-collection.html' }] }),
      makeCheck({ cat: '役員希望', axis: 'governance', q: '入会意思を確認しないまま、役員希望・委員希望を書かせる文書がありますか。', severity: 2, risk: '役員選出の強制化', advice: '加入確認より先に役員希望を書かせる文書は、任意加入と役員協力の境界が曖昧になります。' }),
      makeCheck({ cat: '役員選出', axis: 'governance', q: '役員・委員をくじ引き、抽選、未提出者対象で決める説明がありますか。', severity: 2, risk: '役員選出の強制化', advice: 'くじ引きや未提出者対象の選出は、任意の協力を実質的な義務として扱う運用になり得ます。', links: [{ label: '役員選出', url: '../compliance.html#case05' }] }),
      makeCheck({ cat: '免除申請', axis: 'governance', q: '妊娠、疾病、障害、ひとり親、不登校、家庭事情などを免除理由として書かせる文書がありますか。', severity: 2, risk: '免除申請による家庭事情収集', advice: '家庭事情を免除理由として集める運用は、過度な個人情報収集や心理的負担につながり得ます。' }),
      makeCheck({ cat: '個人情報', axis: 'privacy', q: '個人情報同意書や名簿提供の同意が、学校手続と一体になっていますか。', severity: 3, risk: '学校保有個人情報のPTA利用', advice: '学校手続とPTA同意が一体化している場合、利用目的、提供先、提供項目、本人同意の有無を分けて確認する必要があります。', links: [{ label: '個人情報', url: '../privacy.html' }] }),
      makeCheck({ cat: '不利益', axis: 'facilities', q: '退会・非加入の場合に、子どもへの不利益があるように読める文書がありますか。', severity: 3, risk: '非加入・退会を児童の取扱いと結び付ける運用', advice: 'PTA加入状況を子どもの学校生活上の取扱いと結び付ける説明は、学校教育との分離を確認する必要があります。', links: [{ label: '不利益・差別的取扱い', url: '../compliance.html#case09' }] })
    ],
    officer: [
      makeCheck({ cat: '入会申込', axis: 'membership', q: '入会申込書を整備し、加入希望者本人から明示的な申込を受けていますか。', riskOn: 'no', severity: 3, risk: '入会申込記録の不足', advice: '入会申込書がない、または本人からの明示的申込を確認できない場合、会員管理と会費請求の根拠が弱くなります。' }),
      makeCheck({ cat: '会員台帳', axis: 'membership', q: '入会申込書、退会届、会員台帳が対応しており、誰が会員であるかをPTA自身で説明できますか。', riskOn: 'no', severity: 3, risk: '会員台帳の不整合', advice: '入会申込書、退会届、会員台帳が対応していない場合、会費請求、議決権、役員候補の範囲を説明しにくくなります。' }),
      makeCheck({ cat: '会員名簿', axis: 'privacy', q: 'PTA会員名簿を、PTAが会員本人から直接取得した情報だけで作成していますか。', riskOn: 'no', severity: 3, risk: 'PTA会員名簿の取得元不明', advice: '会員本人から直接取得した情報で説明できない名簿は、学校保有情報の利用や提供の問題につながるおそれがあります。' }),
      makeCheck({ cat: '学校名簿', axis: 'privacy', q: '学校名簿、クラス名簿、児童名簿、保護者連絡先、地区情報を、PTA会員管理に利用していますか。', riskOn: 'yes', severity: 3, risk: '学校保有個人情報のPTA利用', advice: '学校名簿やクラス名簿を会員管理に使っている場合、情報の取得元と本人同意を確認する必要があります。' }),
      makeCheck({ cat: '非会員把握', axis: 'privacy', q: '非会員を把握するために、PTA会員名簿と学校保有の全児童・全保護者情報を突合していますか。', riskOn: 'yes', severity: 3, risk: '非会員把握のための学校情報突合', advice: '非会員を割り出して個別管理する方向ではなく、児童への対応をPTA加入状況と切り離す方向で見直してください。' }),
      makeCheck({ cat: '会費徴収', axis: 'finance', q: 'PTA会費を、学校徴収金と分けて、PTA自身が会員に対して請求・管理していますか。', riskOn: 'no', severity: 3, risk: '学校徴収金とPTA会費の混在', advice: 'PTA会費は、会員台帳に基づきPTA自身が請求・管理できる体制に分ける必要があります。', links: [{ label: '会費徴収', url: '../fee-collection.html' }] }),
      makeCheck({ cat: '学校職員事務', axis: 'personnel', q: 'PTA文書の配布、回収、集計、名簿作成、会費処理を、担任・教頭・事務職員など学校職員に依頼していますか。', riskOn: 'yes', severity: 3, risk: '教職員のPTA事務従事', advice: 'PTA固有事務を学校職員が担う運用は、学校とPTAの分離を不明確にします。PTAが自ら処理する体制へ移行してください。' }),
      makeCheck({ cat: '学校連絡ツール', axis: 'personnel', q: 'PTA連絡を、学校アプリ・学校メール・学校一斉配信システムで行っていますか。', riskOn: 'yes', severity: 2, risk: '学校連絡ツールのPTA利用', advice: '学校連絡ツールでPTA連絡を行う場合、学校手続とPTA活動の境界が曖昧になります。PTA独自の連絡手段を検討してください。' }),
      makeCheck({ cat: '役員選出', axis: 'governance', q: '役員・委員選出を、くじ引き、未提出者対象、電話に出なければ承諾扱いなどで行っていますか。', riskOn: 'yes', severity: 2, risk: '役員選出の強制化', advice: '役員選出は希望制、活動棚卸し、参加できる人が参加する形へ見直す必要があります。' }),
      makeCheck({ cat: '免除審査', axis: 'governance', q: '免除申請のために、妊娠、障害、疾病、ひとり親、不登校、家庭事情などを集めていませんか。', riskOn: 'yes', severity: 2, risk: '免除申請による家庭事情収集', advice: '免除審査のために家庭事情を集める運用は、不要な個人情報収集や心理的負担につながります。' }),
      makeCheck({ cat: '児童の取扱い', axis: 'facilities', q: '児童への対応、行事参加、配布物、記念品、安全活動等を、PTA加入状況と結び付けていますか。', riskOn: 'yes', severity: 3, risk: '非加入・退会を児童の取扱いと結び付ける運用', advice: '児童への対応や学校教育上の取扱いは、PTA加入状況と切り離す方向で整理してください。' }),
      makeCheck({ cat: '学校管理職', axis: 'personnel', q: '校長・教頭など学校管理職が、PTAの主要役職や会計・名簿・役員選出に関与していますか。', riskOn: 'yes', severity: 2, risk: '校長・教頭等のPTA主要役職関与', advice: '学校管理職がPTAの主要役職や会計・名簿・役員選出に関与している場合、学校とPTAの分離が不明確になります。' }),
      makeCheck({ cat: '会則と実務', axis: 'membership', q: '会則に書かれている任意加入・退会・会員管理の規定と、実際の運用が一致していますか。', riskOn: 'no', severity: 2, risk: '会則と実務の不一致', advice: '会則上の文言だけでなく、入会申込書、退会届、会員台帳、会費請求、名簿管理が一致しているか確認してください。' })
    ],
    school: [
      makeCheck({ cat: '配布・回収', axis: 'personnel', q: '学校がPTA文書を配布・回収していますか。', severity: 2, risk: '学校経由提出・担任回収', advice: 'PTA文書を学校が配布・回収している場合、学校手続と任意団体手続の混同が起きていないか確認が必要です。' }),
      makeCheck({ cat: '学校職員関与', axis: 'personnel', q: '担任、教頭、事務職員等が、PTA文書の作成、配布、回収、集計、会費処理、役員選出、名簿管理に関与していますか。', severity: 3, risk: '教職員のPTA事務従事', advice: '学校職員がPTA固有事務を恒常的に担っている場合、学校とPTAの分離を見直す必要があります。', links: [{ label: '教職員関与', url: '../personnel.html' }] }),
      makeCheck({ cat: '制度処理', axis: 'personnel', q: 'PTA関係事務について、校務、職務命令、職専免、兼職兼業の区分と対象作業が文書化されていますか。', riskOn: 'no', severity: 2, risk: '学校側の職務・服務整理が不明確', advice: '具体的作業ごとに、校務としての根拠、職務命令、職専免、兼職兼業、勤務時間、費用負担、決裁を確認してください。' }),
      makeCheck({ cat: '個人情報利用・提供', axis: 'privacy', q: '学校保有の児童・保護者情報を、PTA会員管理、役員選出、地区班、登校班、当番表、協力金依頼等のために学校が自ら利用し、又はPTAへ提供していますか。', riskOn: 'yes', severity: 3, risk: '学校保有情報のPTA目的利用・提供', advice: '学校自身による利用とPTAへの提供を分け、個人情報保護法第61条・第69条の根拠、対象情報、不同意者の除外、利用・提供記録を確認してください。', links: [{ label: '個人情報', url: '../privacy.html' }] }),
      makeCheck({ cat: '学校名簿', axis: 'privacy', q: 'PTAが学校名簿、クラス名簿、保護者連絡先、地区情報を利用していますか。', riskOn: 'yes', severity: 3, risk: '学校保有個人情報のPTA利用', advice: 'PTAが学校名簿やクラス名簿を利用している場合、提供元、利用目的、本人同意、提供記録を確認してください。' }),
      makeCheck({ cat: '会費徴収', axis: 'finance', q: 'PTA会費を学校徴収金と一緒に徴収していますか。', severity: 3, risk: '学校徴収金とPTA会費の混在', advice: 'PTA会費と学校徴収金が混在している場合、任意団体の会費であること、請求主体、会員確認の有無を確認する必要があります。', links: [{ label: '会費徴収', url: '../fee-collection.html' }] }),
      makeCheck({ cat: '学校口座・システム', axis: 'finance', q: '学校口座、学校徴収金システム、学校徴収金案内文書をPTA会費に利用していますか。', severity: 2, risk: '学校徴収金とPTA会費の混在', advice: '学校の徴収金システムや案内文書をPTA会費に使う場合、公私の区分と会員確認を整理する必要があります。' }),
      makeCheck({ cat: '学校連絡ツール', axis: 'personnel', q: '学校連絡アプリ、学校メール、学校配信システムをPTA連絡に利用していますか。', severity: 2, risk: '学校連絡ツールのPTA利用', advice: '学校連絡ツールをPTA連絡に利用すると、学校からの公式連絡とPTA連絡の境界が曖昧になります。' }),
      makeCheck({ cat: '学校手続混在', axis: 'membership', q: '入学説明会、入学式、年度初めの学校手続の中に、PTA加入案内、入会申込、個人情報同意、役員希望調査を混在させていますか。', riskOn: 'yes', severity: 2, risk: '学校手続とPTA手続の混在', advice: '学校手続の中にPTA手続が混在している場合、任意性が保護者へ伝わっているか確認してください。' }),
      makeCheck({ cat: '施設・印刷', axis: 'facilities', q: '学校施設、印刷機、児童経由配布、担任経由回収を、PTAに無条件で利用させていますか。', riskOn: 'yes', severity: 2, risk: '学校施設・印刷機・児童経由配布の利用', advice: '施設、印刷機、児童経由配布、担任回収には、利用条件、費用負担、公平性、学校教育との区分を確認する必要があります。', links: [{ label: '施設利用', url: '../facilities.html' }] }),
      makeCheck({ cat: '児童の取扱い', axis: 'facilities', q: 'PTA加入状況を、児童への対応、配布物、行事参加、登下校、安全活動、記念品等の取扱いと結び付けていますか。', riskOn: 'yes', severity: 3, risk: '非加入・退会を児童の取扱いと結び付ける運用', advice: '児童への対応や学校教育上の取扱いは、PTA加入状況と切り離して整理してください。' }),
      makeCheck({ cat: '非会員把握', axis: 'privacy', q: '非会員への協力金依頼、記念品除外、行事対象者整理等のために、PTA会員情報と学校保有の児童・保護者情報を突合していますか。', riskOn: 'yes', severity: 3, risk: '非会員把握のための学校情報突合', advice: '非会員を割り出して個別対応する方向ではなく、児童に関わる取扱いをPTA加入状況と切り離す方向で整理してください。' }),
      makeCheck({ cat: '教育委員会基準', axis: 'personnel', q: '教育委員会として、学校によるPTA会費徴収、個人情報の利用・提供、文書配布回収、PTA関係事務の関与範囲を確認する基準・通知・点検項目を整備していますか。', riskOn: 'no', severity: 2, risk: '教育委員会通知・点検基準の不足', advice: '学校ごとの慣行に任せず、教育委員会として学校関与の根拠と範囲を確認する基準・通知・点検項目を整備する必要があります。' })
    ]
  };

  function getRequestedMode() {
    const params = new URLSearchParams(window.location.search);
    const rawMode = params.get('mode') || window.location.hash.replace(/^#/, '');
    if (!rawMode) return null;
    return MODE_ALIASES[rawMode.trim().toLowerCase()] || null;
  }

  function makeCounts() {
    return Object.fromEntries(Object.keys(RISK_CONFIG).map((level) => [level, 0]));
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  function uniqueList(items) {
    return [...new Set(items.filter(Boolean))];
  }

  function listHtml(items, ordered = false) {
    const tag = ordered ? 'ol' : 'ul';
    return `<${tag} class="check-result-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${tag}>`;
  }

  function judgeOverall(counts) {
    const level3 = counts[3] || 0;
    const level2 = counts[2] || 0;
    const level1 = counts[1] || 0;
    if (level3 > 0) return {
      level: 3,
      cls: 'lv3',
      eyebrow: '優先確認',
      title: '優先して確認・見直す項目があります',
      summary: '手続、情報管理、学校関与のいずれかで、運用を早めに確認すべき回答がありました。結果は適法性を断定するものではありませんが、関係資料を保存し、学校・PTA・教育委員会へ確認してください。'
    };
    if (level2 > 0) return {
      level: 2,
      cls: 'lv2',
      eyebrow: '運用確認',
      title: '運用の見直しを検討する項目があります',
      summary: '任意性、会員管理、個人情報、学校との分離について、確認した方がよい項目があります。文書と実務が一致しているかを整理してください。'
    };
    if (level1 > 0) return {
      level: 1,
      cls: 'lv1',
      eyebrow: '要確認',
      title: '確認が必要な項目があります',
      summary: '未確認または資料確認が必要な項目があります。分からない項目を無理に判断せず、文書や担当者を確認してください。'
    };
    return {
      level: 0,
      cls: 'lv0',
      eyebrow: '確認結果',
      title: '今回の回答では大きな問題は見えにくい状態です',
      summary: '今回の回答範囲では、大きな問題は見えにくい状態です。今後も文書、会員台帳、同意記録、会費請求方法を保存し、説明できる状態を維持してください。'
    };
  }

  const App = {
    role: null,
    entryRole: null,
    step: 0,
    answers: [],

    init() {
      document.querySelectorAll('[data-role]').forEach((btn) =>
        btn.addEventListener('click', () => this.start(btn.dataset.role)));
      document.getElementById('restartAudit')?.addEventListener('click', () => this.reset());
      document.getElementById('backToHome')?.addEventListener('click', () => { window.location.href = '../index.html'; });
      document.getElementById('shareResult')?.addEventListener('click', () => this.share());
      document.getElementById('printResult')?.addEventListener('click', () => window.print());
      document.getElementById('prevQuestion')?.addEventListener('click', () => this.prev());
      document.getElementById('regenerateAssessment')?.addEventListener('click', () => this.generateAssessment());
      document.getElementById('modalClose')?.addEventListener('click', () =>
        document.getElementById('lawModal')?.classList.remove('is-open'));
      document.getElementById('lawModal')?.addEventListener('click', (event) => {
        if (event.target === event.currentTarget) event.currentTarget.classList.remove('is-open');
      });
      const requestedMode = getRequestedMode();
      if (requestedMode) {
        this.entryRole = requestedMode;
        this.start(requestedMode);
      }
    },

    start(role) {
      this.role = MODE_ALIASES[role] || role;
      this.step = 0;
      this.answers = [];
      this.toggle('intro', false);
      this.toggle('question', true);
      this.toggle('result', false);
      this.renderQuestion();
    },

    reset() {
      this.role = null;
      this.step = 0;
      this.answers = [];
      if (this.entryRole) {
        this.start(this.entryRole);
        return;
      }
      this.toggle('intro', true);
      this.toggle('question', false);
      this.toggle('result', false);
      const intro = document.getElementById('screen-intro');
      if (intro) {
        const top = intro.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    },

    toggle(name, show) {
      document.getElementById(`screen-${name}`)?.classList.toggle('hidden', !show);
    },

    questions() {
      return AUDIT_DB[this.role] || [];
    },

    renderQuestion() {
      const qs = this.questions();
      const q = qs[this.step];
      if (!q) return;

      document.getElementById('progressFill').style.width = `${(this.step / qs.length) * 100}%`;
      document.getElementById('questionCounter').textContent = `${this.step + 1} / ${qs.length}`;
      document.getElementById('questionCategory').textContent = `${q.axisIcon || ''} ${AXIS_LABELS[q.axis] || q.cat} — ${q.cat}`;
      document.getElementById('questionText').textContent = q.q;

      const container = document.getElementById('questionOptions');
      container.innerHTML = '';
      q.opts.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'q-option';
        btn.innerHTML = `
          <span class="q-option-mark">${index + 1}</span>
          <span class="q-option-text">${escapeHtml(opt.t)}</span>`;
        btn.addEventListener('click', () => {
          this.answers[this.step] = { q, opt };
          if (this.step < qs.length - 1) {
            this.step++;
            this.renderQuestion();
          } else {
            this.finish();
          }
        });
        container.appendChild(btn);
      });

      const prev = document.getElementById('prevQuestion');
      if (prev) prev.disabled = this.step === 0;
      const qScreen = document.getElementById('screen-question');
      if (qScreen) {
        const top = qScreen.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    },

    prev() {
      if (this.step > 0) {
        this.step--;
        this.renderQuestion();
      }
    },

    finish() {
      this.toggle('question', false);
      this.toggle('result', true);
      this.renderResult();
      const shell = document.querySelector('.audit-shell');
      if (shell) {
        const top = shell.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    },

    renderResult() {
      const counts = makeCounts();
      const axisMax = {};
      this.answers.forEach(({ q, opt }) => {
        counts[opt.level] = (counts[opt.level] || 0) + 1;
        if (!(q.axis in axisMax) || opt.level > axisMax[q.axis]) axisMax[q.axis] = opt.level;
      });

      const overall = judgeOverall(counts);
      const banner = document.getElementById('riskBanner');
      banner.className = `result-risk-banner ${overall.cls}`;
      document.getElementById('bannerEyebrow').textContent = overall.eyebrow;
      document.getElementById('bannerTitle').textContent = overall.title;
      document.getElementById('bannerSummary').textContent = overall.summary;

      document.getElementById('bannerCounts').innerHTML = Object.entries(counts).map(([level, count]) => {
        if (!count) return '';
        const rc = RISK_CONFIG[level];
        return `<div class="banner-count-chip"><span class="banner-count-num">${count}</span><span>${escapeHtml(rc.label)}</span></div>`;
      }).join('');

      document.getElementById('axisBars').innerHTML = Object.entries(AXIS_LABELS).map(([axis, label]) => {
        const level = axisMax[axis] ?? 0;
        const rc = RISK_CONFIG[level];
        const pct = Math.max(10, rc.barPct);
        return `<div class="axis-bar-item">
          <div class="axis-bar-head">
            <div class="axis-bar-name">${AXIS_ICONS[axis]} ${escapeHtml(label)}</div>
            <div class="axis-bar-risk-label" style="background:${rc.color}22; color:${rc.color};">${escapeHtml(rc.label)}</div>
          </div>
          <div class="axis-bar-track"><div class="axis-bar-fill fill-${rc.cls}" style="width:${pct}%"></div></div>
        </div>`;
      }).join('');

      document.getElementById('riskCountGrid').innerHTML = Object.entries(RISK_CONFIG).map(([level, rc]) => `
        <div class="risk-count-cell ${rc.cls}">
          <div class="risk-count-num">${counts[level] || 0}</div>
          <div class="risk-count-name">${escapeHtml(rc.label)}</div>
        </div>`).join('');

      const details = document.getElementById('resultDetails');
      details.innerHTML = '';
      this.answers.forEach(({ q, opt }) => {
        const rc = RISK_CONFIG[opt.level];
        const links = (opt.links || []).map((link) =>
          `<a href="${escapeHtml(link.url)}" class="answer-link" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)} →</a>`
        ).join('');
        const lawLinks = (opt.laws || []).map((key) => {
          const data = window.LAW_DATA?.[key];
          if (!data) return '';
          return `<button class="answer-link" onclick="App.openLaw('${escapeHtml(key)}')">⚖️ ${escapeHtml(data.title)}</button>`;
        }).join('');
        const card = document.createElement('div');
        card.className = `answer-card ${rc.cls}`;
        card.innerHTML = `
          <div class="answer-card-head">
            <div class="answer-cat">${AXIS_ICONS[q.axis]} ${escapeHtml(q.cat)}</div>
            <div class="answer-risk-pill ${rc.cls}">${escapeHtml(rc.shortLabel)} ${escapeHtml(rc.label)}</div>
          </div>
          <div class="answer-choice">「${escapeHtml(opt.t)}」</div>
          <div class="answer-advice">${escapeHtml(opt.adv)}</div>
          ${lawLinks || links ? `<div class="answer-links">${lawLinks}${links}</div>` : ''}`;
        details.appendChild(card);
      });

      const now = new Date();
      document.getElementById('assessmentDate').textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
      this.generateAssessment();
    },

    generateAssessment() {
      const bodyEl = document.getElementById('assessmentBody');
      const loadingEl = document.getElementById('assessmentLoading');
      const regenBtn = document.getElementById('regenerateAssessment');
      if (loadingEl) loadingEl.style.display = 'none';
      if (regenBtn) regenBtn.disabled = false;
      if (!bodyEl) return;

      const counts = makeCounts();
      this.answers.forEach(({ opt }) => {
        counts[opt.level] = (counts[opt.level] || 0) + 1;
      });
      const overall = judgeOverall(counts);
      const roleConfig = ROLE_CONFIG[this.role] || ROLE_CONFIG.parent;
      const riskItems = uniqueList(this.answers
        .filter(({ opt }) => opt.level >= 2 || opt.key === 'unknown')
        .map(({ opt }) => opt.risk));
      const answerDocs = this.answers
        .filter(({ opt }) => opt.level >= 1)
        .map(({ q }) => q.cat);
      const documents = uniqueList([...roleConfig.documents, ...answerDocs]);
      const links = roleConfig.links || [];

      const risksHtml = riskItems.length
        ? listHtml(riskItems)
        : '<p class="check-result-empty">今回の回答範囲では、重点リスクとして強く表示すべき項目は多くありません。未確認資料が出てきた場合は再度チェックしてください。</p>';

      bodyEl.innerHTML = `
        <section class="check-result-summary">
          <h2>確認結果：${escapeHtml(overall.title)}</h2>
          <p>${escapeHtml(overall.summary)}</p>
        </section>
        <section class="check-result-risks">
          <h3>優先して確認する事項</h3>
          ${risksHtml}
        </section>
        <div class="check-result-grid">
          <section class="check-result-documents">
            <h3>確認すべき文書</h3>
            ${listHtml(documents)}
          </section>
          <section class="check-result-actions">
            <h3>次の確認事項</h3>
            ${listHtml(roleConfig.actions, true)}
          </section>
        </div>
        <div class="check-result-grid">
          <section class="check-result-contacts">
            <h3>確認先</h3>
            ${listHtml(roleConfig.contacts)}
          </section>
          <section class="check-result-questions">
            <h3>文書で確認するときの質問例</h3>
            ${listHtml(roleConfig.questions)}
          </section>
        </div>
        <section class="check-result-links">
          <h3>参照資料</h3>
          <ul>${links.map((link) => `<li><a href="${escapeHtml(link.url)}">${escapeHtml(link.label)} →</a></li>`).join('')}</ul>
        </section>
        <section class="check-result-note">
          <p>${escapeHtml(roleConfig.note)}</p>
          <p style="margin-top:10px">このチェック結果は、個別事案の適法性を断定するものではありません。手元の文書や現在の運用を整理し、どの点を確認すべきかを示すためのものです。必要に応じて、学校、PTA、教育委員会、専門家等に確認してください。</p>
          <p style="margin-top:10px">入力内容はこの端末上での確認にのみ使用し、送信・保存しません。</p>
        </section>`;
      bodyEl.style.display = 'block';
    },

    openLaw(key) {
      const data = window.LAW_DATA?.[key];
      const modal = document.getElementById('lawModal');
      const body = document.getElementById('modalBody');
      if (!data || !modal || !body) return;
      const evidenceHtml = (data.evidence || []).map((item) =>
        `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:8px;background:rgba(26,54,93,.08);color:var(--color-navy);font-weight:700;text-decoration:none;margin:4px;">${escapeHtml(item.label)} ↗</a>`
      ).join('');
      body.innerHTML = `
        <h2 style="font-family:'Noto Serif JP',serif;color:var(--color-navy);margin-bottom:12px;">${escapeHtml(data.title)}</h2>
        ${data.body}
        ${evidenceHtml ? `<div style="margin-top:18px;display:flex;flex-wrap:wrap;gap:8px;">${evidenceHtml}</div>` : ''}`;
      modal.classList.add('is-open');
    },

    share() {
      const title = document.getElementById('bannerTitle').textContent;
      const text = `【PTA運営チェック】\n結果: ${title}\n\nPTA適正化推進委員会の運営チェックで確認しました。`;
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(location.href)}`,
        '_blank',
        'noopener'
      );
    }
  };

  window.App = App;
  window.addEventListener('DOMContentLoaded', () => App.init());
})();
