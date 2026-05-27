/**
 * Civ6 Wiki - Civilization Comparison Tool
 * Contains data for all 35 base civilizations and comparison rendering logic
 */

const CIV_DATA = {
  america: {
    name: "美国",
    nameEn: "America",
    leader: "Theodore Roosevelt",
    icon: "\u{1F1FA}\u{1F1F8}",
    civAbility: { name: "开国元勋 Founding Fathers", desc: "获得所有外交政策卡的传承奖励所需回合数减半" },
    leaderAbility: { name: "罗斯福推论 Roosevelt Corollary", desc: "本大陆的单位 +5 战斗力；每个国家公园提供 +1 魅力给所有城市" },
    uniqueUnit: { name: "粗骑兵 Rough Rider", replaces: "骑兵 Cavalry", desc: "在丘陵作战 +10 战斗力；击杀产生文化；维护费低", combat: 67, movement: 5, cost: 385 },
    uniqueInfra: { name: "电影制片厂 Film Studio", replaces: "广播中心 Broadcast Center", desc: "现代时代后对所有文明 +100% 旅游压力" },
    victory: ["culture", "diplomatic"],
    expansion: "Base Game"
  },
  aztec: {
    name: "阿兹特克",
    nameEn: "Aztec",
    leader: "Montezuma",
    icon: "\u{1F1F2}\u{1F1FD}",
    civAbility: { name: "五日传说 Legend of the Five Suns", desc: "可以花费Builder的使用次数来加速区域建造(每次完成20%)" },
    leaderAbility: { name: "献给大首长的贡品 Gifts for the Tlatoani", desc: "每拥有一种不同的改良奢侈品资源，军事单位+1战斗力；每种奢侈品为城市提供+1宜居度" },
    uniqueUnit: { name: "雄鹰战士 Eagle Warrior", replaces: "战士 Warrior", desc: "击败敌方单位时有概率将其转化为Builder", combat: 28, movement: 2, cost: 65 },
    uniqueInfra: { name: "球场 Tlachtli", replaces: "竞技场 Arena", desc: "额外提供+2信仰和+1大将军点数" },
    victory: ["domination"],
    expansion: "Base Game"
  },
  brazil: {
    name: "巴西",
    nameEn: "Brazil",
    leader: "Pedro II",
    icon: "\u{1F1E7}\u{1F1F7}",
    civAbility: { name: "亚马逊 Amazon", desc: "雨林格提供 +1 相邻加成给学院、商业中心、圣地和剧院广场" },
    leaderAbility: { name: "宽宏大量 Magnanimous", desc: "招募伟人时退还 20% 伟人点数" },
    uniqueUnit: { name: "米纳斯吉拉斯号 Minas Geraes", replaces: "战列舰 Battleship", desc: "远程战斗力 76(+6)，防御战斗力 70(+4)；解锁更早", combat: 70, movement: 5, cost: 430 },
    uniqueInfra: { name: "街头狂欢节 Carnival", replaces: "娱乐中心 Entertainment Complex", desc: "提供 +2 魅力；建造嘉年华项目可获大量伟人点数" },
    victory: ["culture", "religion"],
    expansion: "Base Game"
  },
  canada: {
    name: "加拿大",
    nameEn: "Canada",
    leader: "Wilfrid Laurier",
    icon: "\u{1F1E8}\u{1F1E6}",
    civAbility: { name: "和平四面 Four Faces of Peace", desc: "不能被宣战(除非对方宣布总体战)；不能发动突袭战争；完成紧急事件援助获得+1外交胜利点数" },
    leaderAbility: { name: "最后的最好西部 The Last Best West", desc: "可以在雪地和冻土上建造农场；雪地农场+2粮食；购买雪地/冻土地格费用减半" },
    uniqueUnit: { name: "骑警 Mountie", replaces: "无(独立单位)", desc: "在国家公园附近+5战斗力；可使用能力创建国家公园", combat: 60, movement: 5, cost: 290 },
    uniqueInfra: { name: "冰球场 Hockey Rink", replaces: "无(独立改良设施)", desc: "+1宜居度；相邻体育场+2文化；进入专业体育后+2文化和旅游；每城限1个" },
    victory: ["diplomatic", "culture"],
    expansion: "Gathering Storm"
  },
  china: {
    name: "中国",
    nameEn: "China",
    leader: "秦始皇 Qin Shi Huang",
    icon: "\u{1F1E8}\u{1F1F3}",
    civAbility: { name: "朝代更替 Dynastic Cycle", desc: "尤里卡和鼓舞提供 60% 进度(原50%)" },
    leaderAbility: { name: "始皇帝 The First Emperor", desc: "工人可消耗充能次数加速远古/古典奇观建造(15%)" },
    uniqueUnit: { name: "虎蹲炮 Crouching Tiger", replaces: "无", desc: "近距离高威力火药单位，不需资源；战斗力 50", combat: 50, movement: 2, cost: 160 },
    uniqueInfra: { name: "长城 Great Wall", replaces: "无(改良设施)", desc: "提供防御、文化和旅游。相邻长城段 +1 金币/文化" },
    victory: ["culture", "science"],
    expansion: "Base Game"
  },
  cree: {
    name: "克里",
    nameEn: "Cree",
    leader: "Poundmaker",
    icon: "\u{1F3DC}\u{FE0F}",
    civAbility: { name: "尼希亚维 Nihithaw", desc: "第一次建立贸易路线到另一个文明时获得一个免费贸易者；贸易路线的目的城市3格内获得领土" },
    leaderAbility: { name: "有利条件 Favorable Terms", desc: "所有联盟类型提供共享可见度；国际贸易路线+1粮食/+1金币(每个贸易站+1金币)" },
    uniqueUnit: { name: "奥基奇陶 Okihtcitaw", replaces: "侦察兵 Scout", desc: "战斗力更高；开始即有免费晋升", combat: 20, movement: 3, cost: 40 },
    uniqueInfra: { name: "梅基瓦普 Mekewap", replaces: "无(独特改良设施)", desc: "+1住房/+2金币；相邻奢侈品+1粮食；相邻资源+1产能" },
    victory: ["diplomatic", "culture"],
    expansion: "Rise and Fall"
  },
  egypt: {
    name: "埃及",
    nameEn: "Egypt",
    leader: "Cleopatra",
    icon: "\u{1F1EA}\u{1F1EC}",
    civAbility: { name: "尼罗河的恩赐 Iteru", desc: "建造奇观和区域时，如果相邻河流，建造速度+15%；不会因洪水损失改良设施" },
    leaderAbility: { name: "地中海的新娘 Mediterranean's Bride", desc: "与埃及有贸易路线的其他文明双方+4金币；其他文明与埃及贸易时获得食物和金币加成" },
    uniqueUnit: { name: "玛丽安努战车射手 Maryannu Chariot Archer", replaces: "重型战车 Heavy Chariot", desc: "远程骑兵单位；开阔地形4点移动力；初始即获得1次晋升", combat: 28, movement: 2, cost: 120 },
    uniqueInfra: { name: "狮身人面像 Sphinx", replaces: "无(独立改良设施)", desc: "+1信仰/+1文化；相邻奇观+2信仰；研究飞行后+2旅游" },
    victory: ["culture"],
    expansion: "Base Game"
  },
  england: {
    name: "英国",
    nameEn: "England",
    leader: "Victoria",
    icon: "\u{1F1EC}\u{1F1E7}",
    civAbility: { name: "大英博物馆 British Museum", desc: "考古博物馆拥有6个文物槽位(而非正常的3个)；文物填满后提供更多旅游和文化" },
    leaderAbility: { name: "不列颠治世 Pax Britannica", desc: "在其他大陆建立或征服城市时获得免费近战单位；研究军事学后每座皇家海军造船厂获得免费海军单位" },
    uniqueUnit: { name: "红衫军 Redcoat", replaces: "线列步兵 Line Infantry", desc: "在非首都所在大陆战斗时+10战斗力；不需要战略资源维护", combat: 65, movement: 2, cost: 360 },
    uniqueInfra: { name: "皇家海军造船厂 Royal Navy Dockyard", replaces: "港口 Harbor", desc: "建造费用减半；非首都大陆+2金币+2移动力；+1大海军将军点数" },
    victory: ["domination", "culture"],
    expansion: "Base Game"
  },
  france: {
    name: "法国",
    nameEn: "France",
    leader: "Catherine de Medici",
    icon: "\u{1F1EB}\u{1F1F7}",
    civAbility: { name: "壮游 Grand Tour", desc: "中世纪/文艺复兴/工业时代奇观建造 +20%产能" },
    leaderAbility: { name: "凯瑟琳的飞行中队 Flying Squadron", desc: "额外1级间谍能力；获得免费间谍；与每个文明初次相遇即获得1级情报" },
    uniqueUnit: { name: "皇家卫队 Garde Imperiale", replaces: "线列步兵 Musketman", desc: "在首都所在大陆作战 +10；击杀获得伟人点数", combat: 65, movement: 2, cost: 260 },
    uniqueInfra: { name: "城堡 Chateau", replaces: "无(改良设施)", desc: "必须邻河。+2 文化/+1 旅游(研究飞行后 +2)。邻奇观额外 +2 文化" },
    victory: ["culture"],
    expansion: "Base Game"
  },
  georgia: {
    name: "格鲁吉亚",
    nameEn: "Georgia",
    leader: "Tamar",
    icon: "\u{1F1EC}\u{1F1EA}",
    civAbility: { name: "团结的力量 Strength in Unity", desc: "黄金时代/英雄时代时期获得双倍正常时代加成；专门化时期得分增长更快" },
    leaderAbility: { name: "世界、王国与信仰的荣耀 Glory of the World, Kingdom and Faith", desc: "宣布保护者战争时100%信仰加成持续10回合；所有城墙提供信仰" },
    uniqueUnit: { name: "赫雷苏维提 Khevsur", replaces: "武装步兵 Man-at-Arms", desc: "在丘陵地形不消耗额外移动力；丘陵作战+7战斗力", combat: 45, movement: 2, cost: 160 },
    uniqueInfra: { name: "筑堤堡 Tsikhe", replaces: "文艺复兴城墙 Renaissance Walls", desc: "外防御更高(+3)；提供+3信仰；研究保护后+3旅游" },
    victory: ["religion", "culture"],
    expansion: "Rise and Fall"
  },
  germany: {
    name: "德国",
    nameEn: "Germany",
    leader: "Frederick Barbarossa",
    icon: "\u{1F1E9}\u{1F1EA}",
    civAbility: { name: "自由帝国城市 Free Imperial Cities", desc: "每个城市可额外建造1个区域(超过人口限制)" },
    leaderAbility: { name: "神圣罗马帝国皇帝 Holy Roman Emperor", desc: "对城邦单位 +7 战斗力；每次征服城邦获得1个额外军事政策槽" },
    uniqueUnit: { name: "U型潜艇 U-Boat", replaces: "潜艇 Submarine", desc: "更低生产成本；+1 视野；在深海 +10 战斗力", combat: 65, movement: 4, cost: 430 },
    uniqueInfra: { name: "商业公会 Hansa", replaces: "工业区 Industrial Zone", desc: "超低成本。相邻商业中心+2；相邻资源/区域各+1" },
    victory: ["science", "domination"],
    expansion: "Base Game"
  },
  greece_pericles: {
    name: "希腊(伯里克利)",
    nameEn: "Greece (Pericles)",
    leader: "Pericles",
    icon: "\u{1F1EC}\u{1F1F7}",
    civAbility: { name: "柏拉图学院 Plato's Republic", desc: "无论政体如何，额外获得1个通配符政策槽" },
    leaderAbility: { name: "被光环笼罩 Surrounded by Glory", desc: "每个你作为宗主的城邦 +5% 文化产出" },
    uniqueUnit: { name: "重装步兵 Hoplite", replaces: "枪兵 Spearman", desc: "相邻其他重装步兵时 +10 战斗力", combat: 28, movement: 2, cost: 65 },
    uniqueInfra: { name: "卫城 Acropolis", replaces: "剧院广场 Theater Square", desc: "必须建在丘陵。每个相邻区域 +1 文化；城市中心+1" },
    victory: ["culture", "diplomatic"],
    expansion: "Base Game"
  },
  greece_gorgo: {
    name: "希腊(高尔戈)",
    nameEn: "Greece (Gorgo)",
    leader: "Gorgo",
    icon: "\u{1F1EC}\u{1F1F7}",
    civAbility: { name: "柏拉图学院 Plato's Republic", desc: "无论政体如何，额外获得1个通配符政策槽" },
    leaderAbility: { name: "温泉关 Thermopylae", desc: "击杀敌方单位时获得等同于对方战斗力50%的文化值" },
    uniqueUnit: { name: "重装步兵 Hoplite", replaces: "枪兵 Spearman", desc: "相邻其他重装步兵时 +10 战斗力", combat: 28, movement: 2, cost: 65 },
    uniqueInfra: { name: "卫城 Acropolis", replaces: "剧院广场 Theater Square", desc: "必须建在丘陵。每个相邻区域 +1 文化；城市中心+1" },
    victory: ["culture", "domination"],
    expansion: "Base Game"
  },
  hungary: {
    name: "匈牙利",
    nameEn: "Hungary",
    leader: "Matthias Corvinus",
    icon: "\u{1F1ED}\u{1F1FA}",
    civAbility: { name: "多瑙河的明珠 Pearl of the Danube", desc: "跨河建造区域和建筑时+50%产能加成" },
    leaderAbility: { name: "渡鸦王 Raven King", desc: "征召城邦军队时所有被征召单位+2战斗力和+2移动力；提升城邦为盟友时获得2个免费单位；征召金减半" },
    uniqueUnit: { name: "骑兵 Huszar", replaces: "骑兵 Cavalry", desc: "每有一个有效同盟+3战斗力(最多叠加)", combat: 62, movement: 5, cost: 330 },
    uniqueInfra: { name: "温泉浴场 Thermal Bath", replaces: "动物园 Zoo", desc: "+2宜居度和+2产能；如果城市范围内有地热裂缝额外+3宜居度和+3旅游" },
    victory: ["domination", "diplomatic"],
    expansion: "Gathering Storm"
  },
  india: {
    name: "印度",
    nameEn: "India",
    leader: "Gandhi",
    icon: "\u{1F1EE}\u{1F1F3}",
    civAbility: { name: "达摩 Dharma", desc: "城市中每个派系的信徒都提供该宗教的信徒奖励建筑加成" },
    leaderAbility: { name: "非暴力不合作 Satyagraha", desc: "每个已创立宗教且不在战争状态的文明为印度提供+5信仰；对印度宣战的文明会受到幸福度惩罚" },
    uniqueUnit: { name: "战象 Varu", replaces: "无(独立单位)", desc: "相邻敌方单位-5战斗力；多头战象组队可累计削弱敌人", combat: 40, movement: 2, cost: 200 },
    uniqueInfra: { name: "阶梯井 Stepwell", replaces: "无(独立改良设施)", desc: "+1食物/+1信仰；相邻农场+1食物；相邻圣地+1信仰" },
    victory: ["religion"],
    expansion: "Base Game"
  },
  indonesia: {
    name: "印度尼西亚",
    nameEn: "Indonesia",
    leader: "Gitarja",
    icon: "\u{1F1EE}\u{1F1E9}",
    civAbility: { name: "伟大的群岛帝国 Great Nusantara", desc: "海岸和湖泊格可建造圣地、学院、工业区和剧院广场；相邻海岸/湖泊 +0.5" },
    leaderAbility: { name: "至高三界女神 Exalted Goddess of the Three Worlds", desc: "可用信仰购买海军单位；宗教单位上下船不消耗移动力；城市中心相邻海岸 +2 信仰" },
    uniqueUnit: { name: "戎克船 Jong", replaces: "护卫舰 Frigate", desc: "编队时所有单位获得 +5 战斗力；自身移动力更高", combat: 55, movement: 6, cost: 300 },
    uniqueInfra: { name: "甘榜 Kampung", replaces: "无(改良设施)", desc: "只能建在海岸/湖泊格。+1 住房/+1 产能/+1 粮食。研究科技后额外获得旅游" },
    victory: ["religion", "culture"],
    expansion: "Base Game"
  },
  japan: {
    name: "日本",
    nameEn: "Japan",
    leader: "北条时宗 Hojo Tokimune",
    icon: "\u{1F1EF}\u{1F1F5}",
    civAbility: { name: "明治维新 Meiji Restoration", desc: "所有区域获得每个相邻区域 +1 的额外加成" },
    leaderAbility: { name: "神风 Divine Wind", desc: "沿海格的陆地单位 +5 战斗力；浅海的海军 +5；建造圣地/剧院广场/学院区域 +100% 速度" },
    uniqueUnit: { name: "武士 Samurai", replaces: "骑士附近时代(中世纪近战)", desc: "受伤时不降低战斗力输出", combat: 48, movement: 2, cost: 160 },
    uniqueInfra: { name: "电子工厂 Electronics Factory", replaces: "工厂 Factory", desc: "提供 +4 产能(6格内城市均享受)；通电后额外 +4 文化" },
    victory: ["science", "culture", "domination"],
    expansion: "Base Game"
  },
  korea: {
    name: "韩国",
    nameEn: "Korea",
    leader: "善德女王 Seondeok",
    icon: "\u{1F1F0}\u{1F1F7}",
    civAbility: { name: "三国时代 Three Kingdoms", desc: "建有书院的城市中的矿山 +1 科技；农场 +1 粮食" },
    leaderAbility: { name: "花郎徒 Hwarang", desc: "总督在城市中时 +3% 文化和 +3% 科技" },
    uniqueUnit: { name: "花车 Hwacha", replaces: "野战加农炮 Field Cannon", desc: "远程战斗力 60；不能移动后攻击", combat: 45, movement: 2, cost: 250 },
    uniqueInfra: { name: "书院 Seowon", replaces: "学院 Campus", desc: "基础 +4 科技(不受相邻加成)；每个相邻区域 -1" },
    victory: ["science"],
    expansion: "Rise and Fall"
  },
  macedon: {
    name: "马其顿",
    nameEn: "Macedon",
    leader: "Alexander",
    icon: "\u{1F3DB}\u{FE0F}",
    civAbility: { name: "希腊化融合 Hellenistic Fusion", desc: "征服城市时，城市中每个学院/军营/商业中心/港口/圣地/剧院广场区域提供对应尤里卡/鼓舞" },
    leaderAbility: { name: "征服世界 To World's End", desc: "城市永不厌战；军队全球行军时不疲惫(不受战争疲劳)" },
    uniqueUnit: { name: "持盾卫队 Hypaspist", replaces: "剑士 Swordsman", desc: "攻城时+5战斗力；支援加成+50%", combat: 36, movement: 2, cost: 100 },
    uniqueInfra: { name: "王家学堂 Basilikoi Paides", replaces: "军事学院(军营建筑)", desc: "训练非民用单位时获得25%费用等值的科技(学院类)" },
    victory: ["domination", "science"],
    expansion: "Base Game (DLC)"
  },
  maori: {
    name: "毛利",
    nameEn: "Maori",
    leader: "Kupe",
    icon: "\u{1F1F3}\u{1F1FF}",
    civAbility: { name: "玛纳 Mana", desc: "开局即有航海术和造船术；未改良的树林/雨林+1产能/+1信仰；不能采伐；不能收获资源" },
    leaderAbility: { name: "库佩的远航 Kupe's Voyage", desc: "开局在海洋中出发(不在陆地)；定居时获得免费建造者和+2人口；宫殿+3文化/+5科技" },
    uniqueUnit: { name: "战毛利 Toa", replaces: "剑士 Swordsman", desc: "可建造帕堡(防御改良)；相邻敌人-5战斗力", combat: 36, movement: 2, cost: 120 },
    uniqueInfra: { name: "集会所 Marae", replaces: "露天剧场 Amphitheater", desc: "为城市中所有未改良地形(树林/雨林/沼泽/礁石等)提供+1文化和+1信仰和+1旅游" },
    victory: ["culture"],
    expansion: "Gathering Storm"
  },
  mapuche: {
    name: "马普切",
    nameEn: "Mapuche",
    leader: "Lautaro",
    icon: "\u{1F1E8}\u{1F1F1}",
    civAbility: { name: "托基战斧 Toqui", desc: "对处于黄金时代的文明所有单位+10战斗力；击杀其单位获得额外经验" },
    leaderAbility: { name: "雄鹰猎手 Swift Hawk", desc: "击杀黄金时代文明城市范围内的单位时该城市忠诚度-20；自己的总督城市所有单位+5战斗力" },
    uniqueUnit: { name: "马隆骑兵 Malon Raider", replaces: "轻骑兵 Light Cavalry", desc: "每个相邻友军+5战斗力(最多+25)；低维护费", combat: 55, movement: 5, cost: 250 },
    uniqueInfra: { name: "化学家 Chemamull", replaces: "无(独立改良设施)", desc: "提供等同于地格魅力值75%的文化；研究飞行后转化为旅游" },
    victory: ["domination", "culture"],
    expansion: "Rise and Fall"
  },
  mongolia: {
    name: "蒙古",
    nameEn: "Mongolia",
    leader: "Genghis Khan",
    icon: "\u{1F1F2}\u{1F1F3}",
    civAbility: { name: "驿站系统 Ortoo", desc: "与其他文明建立贸易路线后立即获得外交可见度；所有骑兵+3战斗力(对有贸易代表团的文明)" },
    leaderAbility: { name: "蒙古铁骑 Mongol Horde", desc: "所有骑兵类单位+3战斗力；击败敌方骑兵单位后有概率捕获该单位" },
    uniqueUnit: { name: "怯薛 Keshig", replaces: "骑士 Knight", desc: "远程骑兵单位；可护送民用/支援单位(让其以相同速度移动)", combat: 40, movement: 4, cost: 180 },
    uniqueInfra: { name: "金帐 Ordu", replaces: "马厩 Stable", desc: "该城市训练的所有骑兵和攻城单位额外获得+1移动力" },
    victory: ["domination"],
    expansion: "Rise and Fall"
  },
  netherlands: {
    name: "荷兰",
    nameEn: "Netherlands",
    leader: "Wilhelmina",
    icon: "\u{1F1F3}\u{1F1F1}",
    civAbility: { name: "大河之国 Grote Rivieren", desc: "建造在河流旁的学院/工业区/剧院广场/商业中心获得+2相邻加成" },
    leaderAbility: { name: "无线电橙色 Radio Oranje", desc: "国内贸易路线+1忠诚度；来自/去往外国的贸易路线+1文化" },
    uniqueUnit: { name: "七省号 De Zeven Provincien", replaces: "护卫舰 Frigate", desc: "攻击防御区域时+7战斗力", combat: 55, movement: 5, cost: 300 },
    uniqueInfra: { name: "圩田 Polder", replaces: "无(独特改良设施)", desc: "只能建在水中(海岸/湖泊且相邻3+陆地)；+1粮食/+1产能/+4金币；后期+2住房" },
    victory: ["culture", "science"],
    expansion: "Rise and Fall"
  },
  norway: {
    name: "挪威",
    nameEn: "Norway",
    leader: "Harald Hardrada",
    icon: "\u{1F1F3}\u{1F1F4}",
    civAbility: { name: "维京长船 Knarr", desc: "所有海军单位可进入海洋(不需制图学)；海军近战可在海岸掠夺；陆军登船/下船不消耗额外移动力" },
    leaderAbility: { name: "北方雷霆 Thunderbolt of the North", desc: "所有海军近战单位+7战斗力；海军单位+50%产能加成" },
    uniqueUnit: { name: "狂战士 Berserker", replaces: "长剑兵 Man-At-Arms", desc: "进攻时+7战斗力，防御时-7；拥有4点移动力", combat: 40, movement: 4, cost: 160 },
    uniqueInfra: { name: "木板教堂 Stave Church", replaces: "神殿 Temple", desc: "除了神殿功能外，相邻每块森林地格+1信仰" },
    victory: ["domination"],
    expansion: "Base Game"
  },
  ottoman: {
    name: "奥斯曼",
    nameEn: "Ottoman",
    leader: "Suleiman",
    icon: "\u{1F1F9}\u{1F1F7}",
    civAbility: { name: "土耳其大炮 Great Turkish Bombard", desc: "攻城单位+50%产能；攻城单位对区域防御+5战斗力；征服城市后不损失人口(保留)；征服城市+1宜居度/+4忠诚" },
    leaderAbility: { name: "大维齐尔 Grand Vizier", desc: "解锁独特总督Ibrahim(可派驻到外国城市)；Ibrahim提供军事和外交加成" },
    uniqueUnit: { name: "巴巴里海盗船 Barbary Corsair", replaces: "私掠船 Privateer", desc: "掠夺不消耗移动力；沿海突袭无惩罚", combat: 44, movement: 4, cost: 240 },
    uniqueInfra: { name: "大巴扎 Grand Bazaar", replaces: "银行 Bank", desc: "每种战略资源+1该资源累积；每种奢侈品资源+1宜居度" },
    victory: ["domination"],
    expansion: "Gathering Storm"
  },
  persia: {
    name: "波斯",
    nameEn: "Persia",
    leader: "Cyrus",
    icon: "\u{1F1EE}\u{1F1F7}",
    civAbility: { name: "总督制 Satrapies", desc: "国内贸易路线+2金币和+1文化；国际贸易路线+1文化；研究政治哲学后+1贸易路线容量" },
    leaderAbility: { name: "巴比伦陷落 Fall of Babylon", desc: "宣布突袭战争后所有单位+2移动力持续10回合；宣战时只受50%的好战度惩罚" },
    uniqueUnit: { name: "不死队 Immortal", replaces: "剑士 Swordsman", desc: "同时拥有远程攻击能力(远程战力25)；防御战力高于剑士", combat: 35, movement: 2, cost: 100 },
    uniqueInfra: { name: "波斯庭园 Pairidaeza", replaces: "无(独有改良设施)", desc: "+1文化/+2金币/+2魅力；相邻圣地和剧院区域+1文化；后期提供旅游" },
    victory: ["domination", "culture"],
    expansion: "Base Game (DLC)"
  },
  phoenicia: {
    name: "腓尼基",
    nameEn: "Phoenicia",
    leader: "Dido",
    icon: "\u{1F1F1}\u{1F1E7}",
    civAbility: { name: "地中海殖民地 Mediterranean Colonies", desc: "开始时拥有航海术科技；沿海城市忠诚度不会降到0；开拓者上船移动力不减" },
    leaderAbility: { name: "迦太基建城者 Founder of Carthage", desc: "可以用金币在建有考塔港的城市中迁都；+1贸易路线容量；建造考塔港的城市100%忠诚" },
    uniqueUnit: { name: "双层桨战船 Bireme", replaces: "桨帆船 Galley", desc: "护送时贸易路线单位不能被掠夺；+30战斗力", combat: 35, movement: 3, cost: 65 },
    uniqueInfra: { name: "考塔 Cothon", replaces: "港口 Harbor", desc: "所有该城市的海军单位和开拓者+50%产能；海军单位在此城市回复全部HP" },
    victory: ["domination", "science"],
    expansion: "Gathering Storm"
  },
  poland: {
    name: "波兰",
    nameEn: "Poland",
    leader: "Jadwiga",
    icon: "\u{1F1F5}\u{1F1F1}",
    civAbility: { name: "黄金自由 Golden Liberty", desc: "每次建造军营获得1次文化炸弹(夺取相邻地格)；通配符政策槽变为军事槽时保留一个通配" },
    leaderAbility: { name: "立陶宛联合 Lithuanian Union", desc: "当你的宗教传播到相邻文明城市时，该城市获得一座圣地建筑；圣遗物提供 +4 金币/+2 文化/+2 信仰" },
    uniqueUnit: { name: "翼骑兵 Winged Hussar", replaces: "骑兵 Cavalry", desc: "攻击时如果造成更多伤害则推退防御者；无法被推退时额外伤害", combat: 64, movement: 5, cost: 330 },
    uniqueInfra: { name: "纺织会馆 Sukiennice", replaces: "市场 Market", desc: "提供 +3 金币；国际贸易路线 +2 产能；国内贸易路线 +4 金币" },
    victory: ["religion", "culture"],
    expansion: "Base Game"
  },
  rome: {
    name: "罗马",
    nameEn: "Rome",
    leader: "Trajan",
    icon: "\u{1F1EE}\u{1F1F9}",
    civAbility: { name: "条条大路通罗马 All Roads Lead to Rome", desc: "新建城市自动获得贸易站；首都贸易范围内城市自动连路" },
    leaderAbility: { name: "图拉真圆柱 Trajan's Column", desc: "每个城市建成时获得1栋免费建筑(纪念碑)" },
    uniqueUnit: { name: "军团 Legion", replaces: "剑士 Swordsman", desc: "可建造堡垒和道路(消耗充能)；战斗力更高", combat: 40, movement: 2, cost: 110 },
    uniqueInfra: { name: "浴场 Bath", replaces: "引水渠 Aqueduct", desc: "提供 +2 住房 和 +1 宜居度(普通引水渠只有住房)" },
    victory: ["domination", "culture"],
    expansion: "Base Game"
  },
  russia: {
    name: "俄罗斯",
    nameEn: "Russia",
    leader: "Peter the Great",
    icon: "\u{1F1F7}\u{1F1FA}",
    civAbility: { name: "祖国母亲 Mother Russia", desc: "新建城市额外获得8格领土(标准5格)；冻土格 +1 信仰和 +1 产能" },
    leaderAbility: { name: "改革大帝 The Grand Embassy", desc: "与友好或同盟文明贸易时获得对方已研究科技/市政的科技/文化(每3回合 +1)" },
    uniqueUnit: { name: "哥萨克 Cossack", replaces: "骑兵 Cavalry", desc: "在己方领土 +5 战斗力；攻击后可移动", combat: 67, movement: 5, cost: 340 },
    uniqueInfra: { name: "薰衣草大教堂 Lavra", replaces: "圣地 Holy Site", desc: "每次使用伟人时城市领土扩展1格" },
    victory: ["religion", "culture"],
    expansion: "Base Game"
  },
  scotland: {
    name: "苏格兰",
    nameEn: "Scotland",
    leader: "Robert the Bruce",
    icon: "\u{1F3F4}",
    civAbility: { name: "苏格兰启蒙 Scottish Enlightenment", desc: "快乐的城市+5%科技和+5%产能；狂喜的城市+10%科技和+15%产能" },
    leaderAbility: { name: "班诺克本战役 Bannockburn", desc: "宣布解放战争后+100%产能和+2移动力持续10回合" },
    uniqueUnit: { name: "高地战士 Highlander", replaces: "游骑兵 Ranger", desc: "在丘陵和树林作战+5战斗力", combat: 65, movement: 3, cost: 380 },
    uniqueInfra: { name: "高尔夫球场 Golf Course", replaces: "无(独立改良设施)", desc: "+2金币/+1宜居度；相邻城市中心+1文化；相邻娱乐区+1文化；后期+1旅游/+1住房" },
    victory: ["science", "domination"],
    expansion: "Rise and Fall"
  },
  spain: {
    name: "西班牙",
    nameEn: "Spain",
    leader: "Philip II",
    icon: "\u{1F1EA}\u{1F1F8}",
    civAbility: { name: "珍宝舰队 Treasure Fleet", desc: "跨大陆的贸易路线获得额外金币和信仰；跨大陆建造区域和奇观不需额外回合" },
    leaderAbility: { name: "埃斯科里亚尔 El Escorial", desc: "宗教审判官可清除异教额外1次；单位对不同宗教文明 +4 战斗力" },
    uniqueUnit: { name: "征服者 Conquistador", replaces: "火枪手 Musketman", desc: "与传教士/使徒相邻 +10 战斗力；征服城市时自动传教", combat: 58, movement: 2, cost: 250 },
    uniqueInfra: { name: "传教团 Mission", replaces: "无(改良设施)", desc: "必须不邻城市中心。+2 信仰；非本大陆 +2 信仰 +1 产能；邻学院 +2 科技" },
    victory: ["religion", "domination"],
    expansion: "Base Game"
  },
  sumeria: {
    name: "苏美尔",
    nameEn: "Sumeria",
    leader: "Gilgamesh",
    icon: "\u{1F3DB}\u{FE0F}",
    civAbility: { name: "史诗探索 Epic Quest", desc: "每次占领蛮族哨站获得一个随机部落村庄奖励(额外奖励)" },
    leaderAbility: { name: "恩奇都历险记 Adventures with Enkidu", desc: "与盟友共享战争经验；联合作战时双方获得战斗经验奖励；宣战联合盟友无好战度惩罚" },
    uniqueUnit: { name: "战车 War-Cart", replaces: "无(独立单位，远古时代)", desc: "远古时代重型骑兵单位；不受反骑枪兵加成；对蛮族额外战斗力", combat: 30, movement: 3, cost: 55 },
    uniqueInfra: { name: "金字形神塔 Ziggurat", replaces: "无(独立改良设施)", desc: "+2科技；邻河+1文化；不能建在丘陵" },
    victory: ["domination", "science"],
    expansion: "Base Game"
  },
  vietnam: {
    name: "越南",
    nameEn: "Vietnam",
    leader: "Ba Trieu",
    icon: "\u{1F1FB}\u{1F1F3}",
    civAbility: { name: "九龙江平原 Nine Dragon River Delta", desc: "专属区域只能建在雨林/树林/沼泽上；该地形上陆地单位+5战斗力/+1移动力/+10防御" },
    leaderAbility: { name: "驱逐侵略者 Drive Out the Aggressors", desc: "在树林/雨林/沼泽地形开始回合时+2移动力；在上述地形战斗时+3战斗力" },
    uniqueUnit: { name: "战斗弩手 Voi Chien", replaces: "弩手 Crossbowman", desc: "移动后可攻击；在树林/雨林+5战斗力", combat: 40, movement: 2, cost: 200 },
    uniqueInfra: { name: "军事禅院 Thanh", replaces: "营地 Encampment", desc: "提供+2文化；为相邻区域提供额外文化加成；可建在树林/雨林上(不砍伐)" },
    victory: ["domination", "culture"],
    expansion: "New Frontier Pass"
  },
  zulu: {
    name: "祖鲁",
    nameEn: "Zulu",
    leader: "Shaka",
    icon: "\u{1F1FF}\u{1F1E6}",
    civAbility: { name: "伊西邦戈 Isibongo", desc: "建造军营或完成军团升级后获得免费军团升级(到军队/舰队)；军团/舰队额外 +5 战斗力" },
    leaderAbility: { name: "阿马布特 Amabutho", desc: "军团解锁时代提前到雇佣兵市政；军团/舰队额外 +3 战斗力" },
    uniqueUnit: { name: "因皮 Impi", replaces: "长矛兵升级(Pike and Shot)", desc: "低维护费/快速训练；侧翼加成更强；两次经验晋升", combat: 50, movement: 3, cost: 200 },
    uniqueInfra: { name: "伊坎达 Ikanda", replaces: "军营 Encampment", desc: "提供 +1 住房；军事单位训练速度 +25%；解锁军团升级时提供1次免费升级" },
    victory: ["domination"],
    expansion: "Rise and Fall"
  },

  // === BBG Mod Civilizations ===
  tibet_bbg: {
    name: "吐蕃(BBG)",
    nameEn: "Tibet (BBG)",
    leader: "赤松德赞 Trisong Detsen",
    icon: "\u{1F3D4}\u{FE0F}",
    civAbility: { name: "世界屋脊 Roof of the World", desc: "公民可工作山脉地块(+2信仰/+1粮食)；山脉为2格内区域+1相邻加成；山脉地块单位+3防御" },
    leaderAbility: { name: "长安之克 Conquest of Chang'an", desc: "创立宗教时额外+1总督头衔；同时有寺庙和军营的城市训练军事单位获免费晋升；圣地相邻加成翻倍" },
    uniqueUnit: { name: "宗堡驻军 Dzong Garrison", replaces: "圣地 Holy Site(区域)", desc: "宗堡内驻军+5防御；建筑购买费-20%；为相邻地块+1信仰", combat: 0, movement: 0, cost: 54 },
    uniqueInfra: { name: "宗堡 Dzong", replaces: "圣地 Holy Site", desc: "驻守单位+5防御；建筑购买费-20%；为相邻地块提供+1信仰" },
    victory: ["religion"],
    expansion: "mod"
  },
  swahili_bbg: {
    name: "斯瓦希里(BBG)",
    nameEn: "Swahili (BBG)",
    leader: "阿尔-哈桑 Al-Hasan ibn Sulaiman",
    icon: "\u{26F5}",
    civAbility: { name: "印度洋贸易圈 Indian Ocean Trade", desc: "沿海城市建区域+20%产能；港口建筑额外+2金币+1科技；国际商路为目的城市+1信仰" },
    leaderAbility: { name: "基尔瓦的黄金时代 Golden Age of Kilwa", desc: "港口相邻奇观+1贸易路线容量；3条商路后港口额外+3金币；奇观为港口+2相邻加成" },
    uniqueUnit: { name: "三角帆船 Dhow", replaces: "四桅帆船 Caravel", desc: "移动力+1(5)；停靠外国沿海城市时双方获金币加成", combat: 40, movement: 5, cost: 240 },
    uniqueInfra: { name: "珊瑚石清真寺 Coral Mosque", replaces: "灯塔 Lighthouse", desc: "额外+2信仰/+1大商人点数；允许商路跨洋到其他大陆" },
    victory: ["science"],
    expansion: "mod"
  },
  thule_bbg: {
    name: "图勒(BBG)",
    nameEn: "Thule (BBG)",
    leader: "基维尤克 Kiviuq",
    icon: "\u{2744}\u{FE0F}",
    civAbility: { name: "弓头鲸猎捕 Bowhead Whale Hunt", desc: "建造者可在冻土海岸创造鲸鱼奢侈品；冻土地块+5治愈/回合；冻土+1粮食+1产能" },
    leaderAbility: { name: "极地传说 Arctic Legends", desc: "每3个冻土改良+1文化；冻土改良额外+1信仰；解锁冰屋改良；5+冻土城市+15%文化" },
    uniqueUnit: { name: "乌米亚克大船 Umiak", replaces: "桨帆船 Galley", desc: "移动力+1(4)；可在海冰移动；可搭载1个陆地单位", combat: 30, movement: 4, cost: 65 },
    uniqueInfra: { name: "冰屋 Igloo", replaces: "无(独特改良设施)", desc: "+1住房/+1文化/+1信仰；相邻冰屋+1文化；飞行后+2旅游；仅限冻土" },
    victory: ["culture"],
    expansion: "mod"
  },

  // === 和而不同 v1.3 New Civilizations ===
  siam_mod: {
    name: "暹罗(和而不同)",
    nameEn: "Siam (Mod)",
    leader: "兰甘亨 Ramkhamhaeng",
    icon: "\u{1F3DB}\u{FE0F}",
    civAbility: { name: "曼陀罗体系 Mandala System", desc: "城邦使者获得额外影响力；城邦宗主国加成+50%；国际商路为目的城市+2文化+2金币" },
    leaderAbility: { name: "兰甘亨石碑 Ramkhamhaeng Stele", desc: "有宫殿或纪念碑的城市+2科技+2文化；友好城邦领土内单位+5战斗力；解锁素可泰专属政策卡" },
    uniqueUnit: { name: "战象 War Elephant", replaces: "骑士 Knight", desc: "对步兵+7；相邻敌军-5战斗力(威压)；移动力3；不需马资源", combat: 48, movement: 3, cost: 180 },
    uniqueInfra: { name: "玉佛寺 Wat Phra Kaew", replaces: "寺庙 Temple", desc: "+4信仰/+2文化/+1宜居度；+1大先知和大艺术家点数" },
    victory: ["diplomatic"],
    expansion: "mod"
  },
  mughal_mod: {
    name: "莫卧儿(和而不同)",
    nameEn: "Mughal (Mod)",
    leader: "阿克巴 Akbar",
    icon: "\u{1F54C}",
    civAbility: { name: "苏勒赫-库尔 Sulh-e-Kul", desc: "城市中每种不同宗教+1文化+1科技；奇观建造+15%产能；奇观额外+2旅游" },
    leaderAbility: { name: "帝国议政 Diwan-i-Khas", desc: "招募伟人时获对应时代1项免费市政；总督上任/晋升+20%产能10回合；宫殿+3金币+2大商人点数" },
    uniqueUnit: { name: "曼萨布达尔 Mansabdar", replaces: "骑士 Knight", desc: "战斗力50；不同兵种相邻+3；击杀恢复20HP；需马+铁", combat: 50, movement: 4, cost: 180 },
    uniqueInfra: { name: "莫卧儿花园 Mughal Garden", replaces: "竞技场 Arena", desc: "+2宜居度/+3文化/+1信仰；每座奇观+1旅游" },
    victory: ["culture"],
    expansion: "mod"
  },
  byzantium_mod: {
    name: "拜占庭(和而不同)",
    nameEn: "Byzantium (Mod)",
    leader: "巴西尔二世 Basil II",
    icon: "\u{2625}",
    civAbility: { name: "塔格玛军制 Tagma System", desc: "圣地与军营相邻各+2加成；有圣地城市训练军事单位获免费晋升；击杀敌军+50%宗教压力10回合" },
    leaderAbility: { name: "保加利亚屠夫 Bulgar Slayer", desc: "骑兵对满血敌人+4战斗力；征服有圣地城市免费获使徒；全球最多信徒时所有军事单位+3" },
    uniqueUnit: { name: "铁甲骑兵 Cataphract", replaces: "骑士 Knight", desc: "击杀敌军对相邻敌人-5战斗力3回合；己方宗教领土+3战斗力", combat: 52, movement: 4, cost: 200 },
    uniqueInfra: { name: "圣索菲亚教堂 Hagia Sophia", replaces: "大教堂 Cathedral", desc: "+4信仰/+2文化；宗教单位+1传播次数；信徒数x0.5金币/回合" },
    victory: ["religion", "domination"],
    expansion: "mod"
  },
  zimbabwe_mod: {
    name: "津巴布韦(和而不同)",
    nameEn: "Zimbabwe (Mod)",
    leader: "穆塔帕 Mutapa",
    icon: "\u{1F3D7}\u{FE0F}",
    civAbility: { name: "大津巴布韦 Great Zimbabwe", desc: "矿山/采石场为相邻商业中心+1金币；商路经过有矿山城市+3金币；建奇观获花费20%金币" },
    leaderAbility: { name: "黄金国王 Lord of the Mines", desc: "每3个矿山+1贸易路线容量；国际商路为双方+2金币；6+矿山后奢侈品额外提供2城满意度" },
    uniqueUnit: { name: "罗兹维战士 Rozvi Warrior", replaces: "剑士 Swordsman", desc: "不需铁；矿山地格+7战斗力；击杀为最近城市商业建筑+20%加速", combat: 38, movement: 2, cost: 100 },
    uniqueInfra: { name: "石墙宫殿 Stone Enclosure", replaces: "市场 Market", desc: "+4金币/+1文化；相邻矿山+1金币；商路+2金币；1个雕塑杰作槽" },
    victory: ["science", "domination"],
    expansion: "mod"
  },
  hittite_mod: {
    name: "赫梯(和而不同)",
    nameEn: "Hittite (Mod)",
    leader: "苏庇路里乌玛一世 Suppiluliuma I",
    icon: "\u{2694}\u{FE0F}",
    civAbility: { name: "铁的秘密 Secret of Iron", desc: "发现铁矿即获铁器尤里卡；铁资源+1产能+1科技；3+铁时近战/抗骑单位+3战斗力；战略资源上限+50%" },
    leaderAbility: { name: "万国之王 Great King", desc: "征服城市可选附庸(50%产出上贡不增战争疲劳)；和约获+50外交偏好+1灵感；3+附庸+1外交政策槽" },
    uniqueUnit: { name: "三人战车 Three-Man Chariot", replaces: "重型战车 Heavy Chariot", desc: "攻击后可移动；对城墙+5；不受ZOC限制", combat: 32, movement: 3, cost: 65 },
    uniqueInfra: { name: "哈图沙档案馆 Hattusa Archive", replaces: "图书馆 Library", desc: "+3科技；免费1个远古/古典尤里卡；每个外交关系+0.5科技(最多+3)" },
    victory: ["domination"],
    expansion: "mod"
  }
  // === 和而不同 Remaining Mod Civilizations ===
  tang_mod: {
    name: "唐朝(和而不同)",
    nameEn: "Tang Dynasty (Mod)",
    leader: "李世民 Li Shimin",
    icon: "\u{1F3EF}",
    civAbility: { name: "贞观之治 Rule of Zhenguan", desc: "黄金时代时所有城市产出+15%；每建造一座建筑+2时代得分" },
    leaderAbility: { name: "天可汗 Heavenly Khan", desc: "联盟双方+4外交好感；联盟2级后盟友领土商路+3金币+2文化；城邦宗主国加成翻倍" },
    uniqueUnit: { name: "玄甲军 Xuanjia Cavalry", replaces: "骑士 Knight", desc: "攻击受伤单位+7战斗力；击杀后获1回合额外移动力", combat: 52, movement: 4, cost: 180 },
    uniqueInfra: { name: "含元殿 Hanyuan Hall", replaces: "外交部 Foreign Ministry", desc: "+2外交政策槽/+3文化/+2时代得分；城市奇观建造+15%" },
    victory: ["culture", "diplomatic"],
    expansion: "mod"
  },
  song_mod: {
    name: "宋朝(和而不同)",
    nameEn: "Song Dynasty (Mod)",
    leader: "赵匡胤 Zhao Kuangyin",
    icon: "\u{1F3D4}\u{FE0F}",
    civAbility: { name: "文治天下 Civil Supremacy", desc: "商业中心建筑额外+2科技；学院与商业中心相邻+2加成" },
    leaderAbility: { name: "杯酒释兵权 Cup of Wine", desc: "每有1个非军事区域+1宜居度；商路目的为自己城市时+3金币+2产能" },
    uniqueUnit: { name: "神臂弓 Shenbi Crossbow", replaces: "弩手 Crossbowman", desc: "远程战斗力+5；防御时额外+5；城市驻守时为城市+3防御", combat: 45, movement: 2, cost: 200 },
    uniqueInfra: { name: "瓷窑 Porcelain Kiln", replaces: "工坊 Workshop", desc: "+3产能/+2金币；每条商路+1金币；为城市创造瓷器奢侈品" },
    victory: ["science", "diplomatic"],
    expansion: "mod"
  },
  ming_mod: {
    name: "明朝(和而不同)",
    nameEn: "Ming Dynasty (Mod)",
    leader: "朱棣 Zhu Di",
    icon: "\u{26F5}",
    civAbility: { name: "郑和下西洋 Zheng He's Voyages", desc: "海军单位+1移动力；首次到达新大陆获免费贸易路线；国际海上商路+4金币+2科技" },
    leaderAbility: { name: "永乐大典 Yongle Encyclopedia", desc: "每个杰作额外+2科技；建图书馆时获免费1级灵感；宫殿+2大科学家点数" },
    uniqueUnit: { name: "郑和宝船 Treasure Ship", replaces: "四桅帆船 Caravel", desc: "战斗力更高；可携带2个陆地单位；到外国港口+3金币", combat: 45, movement: 5, cost: 240 },
    uniqueInfra: { name: "卫所 Guard Post", replaces: "军营 Encampment", desc: "+1住房/+2产能；训练单位-20%产能；驻军防御+3" },
    victory: ["science"],
    expansion: "mod"
  },
  shu_han_mod: {
    name: "蜀汉(和而不同)",
    nameEn: "Shu Han (Mod)",
    leader: "诸葛亮 Zhuge Liang",
    icon: "\u{1F4A1}",
    civAbility: { name: "隆中对 Longzhong Plan", desc: "丘陵地格+1产能+1防御；城市中心相邻丘陵+2科技" },
    leaderAbility: { name: "鞠躬尽瘁 Devoted to the End", desc: "总督在城市中+15%产能；总督上任时获免费建造者充能；军事单位在己方领土+3战斗力" },
    uniqueUnit: { name: "木牛流马 Wooden Ox", replaces: "无(独特支援单位)", desc: "提供相邻军事单位+1移动力；可携带战略资源运输补给", combat: 0, movement: 3, cost: 120 },
    uniqueInfra: { name: "都江堰 Dujiangyan", replaces: "引水渠 Aqueduct", desc: "+3住房/+2粮食/+1产能；为6格内农场额外+1粮食" },
    victory: ["science"],
    expansion: "mod"
  },
  silla_mod: {
    name: "新罗(和而不同)",
    nameEn: "Silla (Mod)",
    leader: "金春秋 Kim Chunchu",
    icon: "\u{1F3EF}",
    civAbility: { name: "花郎道 Hwarangdo", desc: "军事单位在战斗中获得科技值(等于伤害50%)；学院区域相邻山脉+2" },
    leaderAbility: { name: "三韩统一 Unification of Three Kingdoms", desc: "征服城市时获免费尤里卡；与城邦联盟加成+100%；每有1个城邦宗主身份+2外交好感" },
    uniqueUnit: { name: "花郎 Hwarang", replaces: "骑士 Knight", desc: "每获1次晋升额外+2战斗力(永久)；击杀获文化", combat: 48, movement: 4, cost: 180 },
    uniqueInfra: { name: "瞻星台 Cheomseongdae", replaces: "图书馆 Library", desc: "+4科技；相邻山脉每座+1科技；每时代额外+1大科学家点数" },
    victory: ["science"],
    expansion: "mod"
  },
  goguryeo_mod: {
    name: "高句丽(和而不同)",
    nameEn: "Goguryeo (Mod)",
    leader: "广开土王 Gwanggaeto",
    icon: "\u{2694}\u{FE0F}",
    civAbility: { name: "山城国家 Mountain Fortress State", desc: "山脉相邻城市+3防御+2产能；丘陵单位+5战斗力" },
    leaderAbility: { name: "开疆拓土 Expand Territory", desc: "征服城市时领土扩张加速；军事单位在丘陵+2移动力；每有5个军事单位+1时代得分/回合" },
    uniqueUnit: { name: "铠马骑兵 Armored Cavalry", replaces: "骑士 Knight", desc: "丘陵地形+7战斗力；不受地形移动惩罚", combat: 52, movement: 4, cost: 200 },
    uniqueInfra: { name: "山城 Mountain Fortress", replaces: "无(独特改良设施)", desc: "只能建在丘陵/山脉旁；+2产能+2防御；驻军+7战斗力" },
    victory: ["domination"],
    expansion: "mod"
  },
  champa_mod: {
    name: "占婆(和而不同)",
    nameEn: "Champa (Mod)",
    leader: "因陀罗跋摩 Indravarman",
    icon: "\u{26F5}",
    civAbility: { name: "海上丝路 Maritime Silk Road", desc: "沿海城市+1贸易路线容量；国际海上商路+3金币+2信仰" },
    leaderAbility: { name: "占城稻 Champa Rice", desc: "沿海城市农场+1粮食；港口相邻海洋资源+2；每条海上商路为港口城市+1粮食" },
    uniqueUnit: { name: "占婆战船 Champa Warship", replaces: "护卫舰 Frigate", desc: "掠夺不消耗移动力；沿海掠夺获信仰", combat: 55, movement: 5, cost: 280 },
    uniqueInfra: { name: "美山圣地 My Son Sanctuary", replaces: "圣地 Holy Site", desc: "+2信仰/+2文化；建筑提供旅游；相邻海洋+1信仰" },
    victory: ["religion", "science"],
    expansion: "mod"
  },
  majapahit_mod: {
    name: "满者伯夷(和而不同)",
    nameEn: "Majapahit (Mod)",
    leader: "加查马达 Gajah Mada",
    icon: "\u{26F5}",
    civAbility: { name: "群岛帝国 Archipelago Empire", desc: "沿海城市忠诚度永不降低；跨海贸易路线+3金币+2产能" },
    leaderAbility: { name: "帕拉帕誓言 Palapa Oath", desc: "征服沿海城市不损失人口；海军征服获+50%战利品；每征服1座岛屿城市+1时代得分" },
    uniqueUnit: { name: "爽船 Jong", replaces: "护卫舰 Frigate", desc: "编队移动时全队+5战斗力；移动力+1", combat: 55, movement: 6, cost: 280 },
    uniqueInfra: { name: "Candi神庙 Candi Temple", replaces: "寺庙 Temple", desc: "+3信仰/+2文化/+1旅游；相邻海岸+1信仰" },
    victory: ["domination"],
    expansion: "mod"
  },
  dai_viet_mod: {
    name: "大越(和而不同)",
    nameEn: "Dai Viet (Mod)",
    leader: "黎利 Le Loi",
    icon: "\u{2694}\u{FE0F}",
    civAbility: { name: "抗敌救国 Resist Foreign Aggression", desc: "在己方领土作战时所有单位+5战斗力+1移动力；被宣战后10回合内产能+30%" },
    leaderAbility: { name: "蓝山起义 Lam Son Uprising", desc: "击杀入侵单位获金币和文化；防御战争中晋升加速+50%；和约后+3时代得分" },
    uniqueUnit: { name: "义军 Nghia Quan", replaces: "剑士 Swordsman", desc: "在己方领土+10战斗力；不需铁；维护费极低", combat: 36, movement: 2, cost: 90 },
    uniqueInfra: { name: "文庙 Temple of Literature", replaces: "大学 University", desc: "+5科技/+2文化；每个大科学家+1文化/回合" },
    victory: ["science", "culture"],
    expansion: "mod"
  },
  tibet_mod: {
    name: "吐蕃(和而不同)",
    nameEn: "Tibet (Mod)",
    leader: "松赞干布 Songtsen Gampo",
    icon: "\u{1F3D4}\u{FE0F}",
    civAbility: { name: "雪域高原 Land of Snows", desc: "山脉地块为圣地+2相邻加成；高海拔城市信仰产出+30%" },
    leaderAbility: { name: "藏传佛教 Tibetan Buddhism", desc: "创教时额外+1信条选择；宗教单位在山脉地形+2移动力+5战斗力" },
    uniqueUnit: { name: "吐蕃铁骑 Tibetan Iron Cavalry", replaces: "骑士 Knight", desc: "山脉/丘陵不消耗额外移动力；在高地+7战斗力", combat: 50, movement: 4, cost: 180 },
    uniqueInfra: { name: "佛寺 Buddhist Monastery", replaces: "寺庙 Temple", desc: "+4信仰/+1文化；相邻山脉每座+1信仰；+1大先知点数" },
    victory: ["religion"],
    expansion: "mod"
  },
  khmer_mod: {
    name: "高棉(和而不同)",
    nameEn: "Khmer (Mod)",
    leader: "阇耶跋摩七世 Jayavarman VII",
    icon: "\u{1F3DB}\u{FE0F}",
    civAbility: { name: "大吴哥 Angkor Thom", desc: "圣地与引水渠相邻各+2加成；有圣地城市人口+10%增长速度" },
    leaderAbility: { name: "慈悲之王 King of Compassion", desc: "圣遗物获旅游翻倍；医院建筑提供信仰；每有5个信徒的城市+1宜居度" },
    uniqueUnit: { name: "战象弩车 Domrey", replaces: "攻城锤 Battering Ram", desc: "远程攻城单位；对城墙+10；移动后可攻击", combat: 45, movement: 2, cost: 200 },
    uniqueInfra: { name: "宝塔 Prasat", replaces: "寺庙 Temple", desc: "+4信仰/+2文化；圣遗物槽+1；每个圣遗物+4旅游" },
    victory: ["religion", "culture"],
    expansion: "mod"
  },
  burma_mod: {
    name: "缅甸(和而不同)",
    nameEn: "Burma (Mod)",
    leader: "莽应龙 Bayinnaung",
    icon: "\u{1F418}",
    civAbility: { name: "万塔之国 Land of Pagodas", desc: "每有1座宗教建筑+1信仰+1战斗力(全军)；圣地区域+50%产能" },
    leaderAbility: { name: "征服传教 Conquest and Faith", desc: "征服城市时自动传播己方宗教；军事单位在有己方宗教城市旁+3战斗力" },
    uniqueUnit: { name: "白象骑兵 White Elephant", replaces: "骑士 Knight", desc: "对步兵+7；相邻友军+3战斗力(光环)；在丛林/树林无移动惩罚", combat: 50, movement: 4, cost: 190 },
    uniqueInfra: { name: "瑞光塔 Shwedagon Pagoda", replaces: "大教堂 Cathedral", desc: "+5信仰/+2文化/+1宜居度；宗教单位+1传播次数" },
    victory: ["religion", "domination"],
    expansion: "mod"
  },
  assyria_mod: {
    name: "亚述(和而不同)",
    nameEn: "Assyria (Mod)",
    leader: "亚述巴尼拔 Ashurbanipal",
    icon: "\u{2694}\u{FE0F}",
    civAbility: { name: "亚述战争机器 Assyrian War Machine", desc: "攻城单位+30%产能；征服城市获免费尤里卡(每座城最多2个)" },
    leaderAbility: { name: "皇家图书馆 Royal Library", desc: "征服有学院的城市获大科学家点数；图书馆+2科技；每征服3座城市获免费科技" },
    uniqueUnit: { name: "攻城锤战车 Siege Tower Chariot", replaces: "攻城塔 Siege Tower", desc: "移动力+1；相邻攻城单位+5战斗力；可进行近战攻击", combat: 30, movement: 3, cost: 100 },
    uniqueInfra: { name: "哈图沙档案馆 Royal Archive", replaces: "图书馆 Library", desc: "+3科技；每个已征服城市+0.5科技(最多+5)；1个文书杰作槽" },
    victory: ["domination", "science"],
    expansion: "mod"
  },
  bulgaria_mod: {
    name: "保加利亚(和而不同)",
    nameEn: "Bulgaria (Mod)",
    leader: "西美昂一世 Simeon I",
    icon: "\u{1F3F0}",
    civAbility: { name: "可汗遗产 Legacy of the Khans", desc: "军营为相邻剧院广场+2加成；军事单位晋升时获文化值" },
    leaderAbility: { name: "文学黄金时代 Literary Golden Age", desc: "黄金时代时文化+20%；每有1座剧院广场+1时代得分/回合；伟大作品产出翻倍" },
    uniqueUnit: { name: "保加尔骑兵 Bulgar Cavalry", replaces: "骑士 Knight", desc: "在己方领土+5战斗力；击杀获文化和时代得分", combat: 50, movement: 4, cost: 180 },
    uniqueInfra: { name: "普列斯拉夫文学院 Preslav Academy", replaces: "大学 University", desc: "+5科技/+3文化；每个伟大作品+1科技" },
    victory: ["culture", "domination"],
    expansion: "mod"
  }
};

// Victory type labels
const VICTORY_LABELS = {
  culture: "文化胜利",
  science: "科技胜利",
  domination: "征服胜利",
  religion: "宗教胜利",
  diplomatic: "外交胜利"
};

// Populate dropdowns on load
(function initSelectors() {
  const selects = [
    document.getElementById('civ-select-1'),
    document.getElementById('civ-select-2'),
    document.getElementById('civ-select-3')
  ];
  const sortedKeys = Object.keys(CIV_DATA).sort((a, b) =>
    CIV_DATA[a].name.localeCompare(CIV_DATA[b].name, 'zh-CN')
  );
  selects.forEach((sel, idx) => {
    sortedKeys.forEach(key => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = CIV_DATA[key].name + ' ' + CIV_DATA[key].nameEn;
      sel.appendChild(opt);
    });
  });
})();

function doCompare() {
  const sel1 = document.getElementById('civ-select-1').value;
  const sel2 = document.getElementById('civ-select-2').value;
  const sel3 = document.getElementById('civ-select-3').value;

  const selected = [sel1, sel2, sel3].filter(v => v !== '');
  if (selected.length < 2) {
    alert('请至少选择2个文明进行对比');
    return;
  }
  // Check duplicates
  if (new Set(selected).size !== selected.length) {
    alert('请勿选择重复的文明');
    return;
  }

  renderComparison(selected);
}

function resetCompare() {
  document.getElementById('civ-select-1').value = '';
  document.getElementById('civ-select-2').value = '';
  document.getElementById('civ-select-3').value = '';
  document.getElementById('compare-result').innerHTML = `
    <div class="compare-placeholder">
      <span class="placeholder-icon">&#9878;</span>
      <p>选择 2-3 个文明后点击「对比」查看详细对比结果</p>
    </div>
  `;
}

function renderComparison(keys) {
  const civs = keys.map(k => CIV_DATA[k]);
  const numCols = civs.length;
  const colClass = numCols === 2 ? 'cols-2' : 'cols-3';

  // Build rows
  const rows = [
    { label: "文明能力", field: "civAbility", render: c => `<strong>${c.civAbility.name}</strong>${c.civAbility.desc}` },
    { label: "领袖能力", field: "leaderAbility", render: c => `<strong>${c.leaderAbility.name}</strong>${c.leaderAbility.desc}` },
    { label: "特色单位", field: "uniqueUnit", render: c => `<strong>${c.uniqueUnit.name}</strong>替代: ${c.uniqueUnit.replaces}<br>${c.uniqueUnit.desc}<br><span style="color:var(--text-muted);font-size:0.8rem;">战斗力 ${c.uniqueUnit.combat} | 移动 ${c.uniqueUnit.movement} | 产能 ${c.uniqueUnit.cost}</span>` },
    { label: "特色建筑/设施", field: "uniqueInfra", render: c => `<strong>${c.uniqueInfra.name}</strong>替代: ${c.uniqueInfra.replaces}<br>${c.uniqueInfra.desc}` },
    { label: "推荐胜利路线", field: "victory", render: c => c.victory.map(v => `<span class="victory-tag ${v}">${VICTORY_LABELS[v]}</span>`).join('') },
    { label: "DLC/资料片", field: "expansion", render: c => c.expansion }
  ];

  // Check which rows have differences
  function rowHasDiff(row) {
    if (row.field === 'victory') {
      const strs = civs.map(c => c.victory.sort().join(','));
      return new Set(strs).size > 1;
    }
    if (row.field === 'civAbility') {
      const strs = civs.map(c => c.civAbility.name);
      return new Set(strs).size > 1;
    }
    return true; // Most fields differ by default
  }

  let html = `<div class="compare-grid ${colClass}">`;

  // Header row
  html += `<div class="compare-label" style="border-bottom:2px solid var(--accent-gold-dark);background:var(--bg-tertiary);justify-content:center;font-size:1rem;">VS</div>`;
  civs.forEach(c => {
    html += `<div class="compare-header"><span class="civ-icon">${c.icon}</span><div class="civ-name">${c.name}</div><div class="civ-leader">${c.leader}</div></div>`;
  });

  // Data rows
  rows.forEach(row => {
    const isDiff = rowHasDiff(row);
    const diffClass = isDiff ? ' highlight-diff' : '';
    html += `<div class="compare-label${diffClass}">${row.label}</div>`;
    civs.forEach(c => {
      html += `<div class="compare-cell${diffClass}">${row.render(c)}</div>`;
    });
  });

  html += '</div>';

  // Summary section
  html += `<div class="strategy-section" style="margin-top:2rem;">`;
  html += `<h3>对比总结</h3>`;
  civs.forEach(c => {
    html += `<div class="strategy-tip"><span class="tip-icon">${c.icon}</span><span class="tip-text"><strong>${c.name} (${c.nameEn})</strong> — 推荐走 ${c.victory.map(v => VICTORY_LABELS[v]).join(' / ')} 路线。核心优势: ${c.civAbility.name}。</span></div>`;
  });
  html += '</div>';

  document.getElementById('compare-result').innerHTML = html;
}
