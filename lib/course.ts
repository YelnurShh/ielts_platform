export type Lesson={id:number;title:string;unit:string;type:"foundation"|"discussion"|"opinion"|"advantage"|"problem"|"two-part"|"exam";duration:number;status:"available"|"locked";summary:string;steps:string[]};
export const units=[
 {id:0,title:"Foundation",range:"1–2",description:"Негізгі академиялық жазу дағдылары"},
 {id:1,title:"Discussion Essays",range:"3–9",description:"Discussion essay құрылымы мен аргументтері"},
 {id:2,title:"Agree / Disagree",range:"10–16",description:"Позиция, thesis және idea development"},
 {id:3,title:"Advantage / Disadvantage",range:"17–22",description:"Артықшылықтар мен кемшіліктерді салыстыру"},
 {id:4,title:"Problem / Solution",range:"23–28",description:"Мәселе, себеп және шешімдерді талдау"},
 {id:5,title:"Two-Part Question",range:"29–32",description:"Екі бөлікке бөлінген сұрақтарды жауаптау"},
 {id:6,title:"Exam Practice",range:"33",description:"Mixed essay practice"},
 {id:7,title:"Final",range:"34",description:"Final IELTS Writing Task 2 Mock Test"}
];
export const lessons:Lesson[]=[
 {id:1,title:"IELTS Writing Task 2 Overview",unit:"Foundation",type:"foundation",duration:18,status:"available",summary:"Task 2 форматы, мақсаттары және жоғары деңгейлі жұмыс алгоритмі.",steps:["Learn — task overview","Question analysis","Planning basics","Self-check"]},
 {id:2,title:"General Essay Writing Skills",unit:"Foundation",type:"foundation",duration:22,status:"available",summary:"Эссе құрылымы, paragraph logic және academic writing негіздері.",steps:["Learn — essay structure","Brainstorming","Essay planning","Guided writing"]},
 {id:3,title:"Discussion Essays — Question Analysis",unit:"Discussion Essays",type:"discussion",duration:24,status:"available",summary:"Discussion сұрағын бөліктерге ажыратып, екі позицияны тең талдау.",steps:["Learn","Question Surgery","Sort ideas","Plan","Write","Self-check"]},
 {id:4,title:"Discussion Essays — Body Paragraphs",unit:"Discussion Essays",type:"discussion",duration:26,status:"locked",summary:"Екі жақты аргументті дамыту және paragraph cohesion.",steps:["Theory","Idea development","Plan","Writing","Rewrite"]},
 {id:10,title:"Agree / Disagree — Thesis Statement",unit:"Agree / Disagree",type:"opinion",duration:25,status:"locked",summary:"Clear position және thesis statement құру.",steps:["Question analysis","Position","Thesis","Practice"]},
 {id:17,title:"Advantage / Disadvantage — Core Structure",unit:"Advantage / Disadvantage",type:"advantage",duration:25,status:"locked",summary:"Артықшылық пен кемшілікті құрылымдастыру.",steps:["Question type","Brainstorm","Plan","Write"]},
 {id:23,title:"Problem / Solution — Understanding the Question",unit:"Problem / Solution",type:"problem",duration:28,status:"locked",summary:"Problem, cause және solution компоненттерін анықтау.",steps:["Learn","Question Surgery","Sort","Plan","Write","Check","Rewrite"]},
 {id:29,title:"Two-Part Question — Response Strategy",unit:"Two-Part Question",type:"two-part",duration:26,status:"locked",summary:"Екі сұраққа толық әрі тең жауап беретін жоспар құру.",steps:["Analyze","Brainstorm","Plan","Write","Feedback"]},
 {id:33,title:"Mixed Essay Practice",unit:"Exam Practice",type:"exam",duration:40,status:"locked",summary:"Әртүрлі essay type бойынша exam-style practice.",steps:["Identify type","Plan","Write","Self-assess"]},
 {id:34,title:"Final IELTS Writing Task 2 Mock Test",unit:"Final",type:"exam",duration:60,status:"locked",summary:"Толық финалдық mock test және rewrite.",steps:["Task","Write","Self-check","Feedback","Rewrite"]}
];
export const getLesson=(id:number)=>lessons.find(x=>x.id===id);
