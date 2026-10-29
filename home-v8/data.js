import { copy } from './copy.js';

/** @typedef {{file:string,width:number,height:number,x?:number,y?:number,crop?:string,mask?:boolean}} Logo */
/** @typedef {{name:string,description:string,logos:Logo[],url?:string}} Brand */
/** @typedef {{name:string,node:string,image:string,crop?:string,description:string,brands:Brand[],overlays:number}} Division */
// Direction descriptions are written from the brand facts in Figma (the Figma frames repeat the Agro text in every direction).
/** @typedef {{title:string,description:string,image:string,crop?:string,node:string}} Value */
/** @typedef {{name:string,address:string,logo?:Logo}} Office */
/** @typedef {{id:string,name:string,x:number,y:number,offices:Office[]}} Region */
export const asset = (name) => `./assets/images/${name}`;
const text = (id) => copy[`2647:${id}`];
const logo = (file,width,height,extra={}) => ({file,width,height,...extra});
const localFood = logo('b63d1.svg',115,40,{mask:true});
const aqbalyq = logo('1518a.svg',58.1055,46.3396,{x:-2.105,y:-1});

/** @type {Value[]} */
export const values = [
  {title:text(240),description:text(253),image:'d32fd.png',node:'2647:228'},
  {title:text(244),description:text(10332),image:'c8b14.png',crop:'value-crop-2',node:'2647:10306'},
  {title:text(248),description:text(10360),image:'82e2e.png',crop:'value-crop-3',node:'2647:10333'},
  {title:text(252),description:text(10388),image:'37e41.png',node:'2647:10361'},
];

/** @type {Division[]} */
export const divisions = [
  {name:'Agro',node:'2647:274',image:'company-agro.png',description:'Полный цикл агропроизводства: зерновые и масличные культуры, молочная ферма, конеферма и рыбоводческое хозяйство. Продукция выходит под брендами Local Food KZ и Aqbalyq KZ.',overlays:2,brands:[
    {name:'Local Food KZ — растениеводство',description:text(303),logos:[localFood]},
    {name:'Aqbalyq KZ — молочное производство',description:text(331),logos:[aqbalyq]},
    {name:'Local Food KZ — саумал',description:text(339),logos:[{...localFood,file:'f822a.svg'}]},
    {name:'Aqbalyq KZ — рыбоводство',description:text(367),logos:[aqbalyq]},
  ]},
  {name:'Engineering',node:'2647:10143',image:'97292.png',crop:'engineering-crop',description:'Проектирование и производство надстроек для коммерческой и специальной техники, выпуск спецтехники Sinotruk, а также ее сервисное и гарантийное обслуживание.',overlays:2,brands:[
    {name:'TEHNOPARK KZ',description:text(10167),logos:[logo('5ee27.png',206,27)],url:'https://thp.kz/kz'},
    {name:'Saran Machinery',description:text(10171),logos:[logo('84496.png',99,40)],url:'https://saranmachinery.kz/'},
  ]},
  {name:'Auto',node:'2647:10172',image:'e02b1.png',crop:'auto-crop',description:'Продажа новых легковых и коммерческих автомобилей казахстанского и мирового производства, автомобили с пробегом и сервисное обслуживание полного цикла.',overlays:2,brands:[
    {name:'Allur',description:text(10195),logos:[logo('3f4a0.png',120,36,{crop:'allur-crop'})],url:'https://allur.kz/'},
  ]},
  {name:'Logistic',node:'2647:10254',image:'e0a35.png',crop:'logistic-crop',description:'Автомобильные и железнодорожные перевозки по Казахстану и СНГ в сочетании с собственным хабом для обработки, хранения и перевалки грузов.',overlays:1,brands:[
    {name:'Транстех · Седьмой путь',description:text(10277),logos:[logo('34071.png',130,23.344),logo('cebbd.png',96.744,40,{x:153.63})]},
    {name:'Тобол',description:text(10282),logos:[logo('f52bb.png',143.053,36)]},
  ]},
  {name:'Construction',node:'2647:10196',image:'75745.png',description:'Строительство промышленных, гражданских и социальных объектов на основе собственной производственной базы: от сырья из своего карьера до кирпича и металлопрофиля.',overlays:1,brands:[
    {name:'ЖайсанСтрой',description:text(10248),logos:[logo('77815.png',99.649,40)]},
    {name:'Рудненский кирпичный завод',description:text(10253),logos:[logo('89c0f.png',113.929,40)]},
  ]},
  {name:'Recycling',node:'2647:10283',image:'1eb69.png',description:'Переработка промышленных отходов и вторичного сырья на собственном комплексе, который одновременно работает с четырьмя основными видами отходов.',overlays:1,brands:[
    {name:'KST Recycling',description:text(10305),logos:[logo('04b29.png',196.706,32)]},
  ]},
  {name:'Tech',node:'2647:10389',image:'company-tech.png',description:'Технологическое направление группы ULAR. Под брендом QazDefense мы ведем собственную IT-разработку и создаем цифровые продукты, расширяя технологические компетенции экосистемы.',overlays:2,brands:[
    {name:'QazDefense',description:text(10412),logos:[logo('dd7eb.png',192.889,32,{y:0})],url:'https://qazdefense.kz/'},
  ]},
  {name:'Retail',node:'2647:10413',image:'e3115.png',crop:'retail-crop',description:'Направление, обращенное к людям и их здоровью: собственный фитнес-центр Invictus GO предлагает услуги по физической подготовке и фитнес-направлениям для тех, кто выбирает активный образ жизни.',overlays:2,brands:[
    {name:'Invictus GO',description:text(10436),logos:[logo('423f2.png',43.561,40,{crop:'invictus-crop'})],url:'https://invictusgo.kz/'},
  ]},
];

/** @type {Region[]} */
export const regions = [
  {id:'kostanay',name:'Костанай',x:536,y:122,offices:[
    {name:'TEHNOPARK KZ',address:text(10082),logo:logo('5ee27.png',157.622,20.25)},
    {name:'Транстех',address:text(10087),logo:logo('34071.png',130,23.344)},
    {name:'Седьмой путь',address:text(10092),logo:logo('990c4.png',84.231,30,{crop:'seventh-crop'})},
    {name:'Тобол',address:text(10097),logo:logo('f52bb.png',102.194,26)},
    {name:'',address:text(10101)},
    {name:'',address:text(10105)},
    {name:'QazDefense',address:text(10110),logo:logo('dd7eb.png',180.833,30)},
    {name:'KST Recycling',address:text(10115),logo:logo('04b29.png',184.412,30)},
    {name:'',address:text(10120),logo:logo('ae427.png',74.737,30)},
    {name:'',address:text(10125),logo:logo('ae427.png',74.737,30)},
  ]},
  {id:'rudny',name:'Рудный',x:520,y:176,offices:[{name:'Рудненский кирпичный завод',address:text(3522),logo:logo('89c0f.png',85.446,30)}]},
  {id:'saran',name:'Сарань',x:842,y:290,offices:[{name:'',address:text(10134)}]},
  {id:'koldi',name:'Кольди',x:950,y:582,offices:[{name:'',address:text(10142)}]},
];

export const news = [
  {title:text(373),date:text(375),category:text(376)},
  {title:text(379),date:text(381),category:text(382)},
  {title:text(385),date:text(386),category:''},
];
