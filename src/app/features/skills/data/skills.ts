export interface Skill {
  readonly name: string;
  readonly icon: string;
}

const ICON_BASE = 'assets/images/skills';

export const SKILLS: readonly Skill[] = [
  { name: 'HTML & CSS', icon: `${ICON_BASE}/htmlcss.svg` },
  { name: 'JavaScript', icon: `${ICON_BASE}/javascript.svg` },
  { name: 'TypeScript', icon: `${ICON_BASE}/typescript.svg` },
  { name: 'Angular', icon: `${ICON_BASE}/angular.svg` },
  { name: 'Deep Learning', icon: `${ICON_BASE}/deeplearning.svg` },
  { name: 'Large / Small Language Models', icon: `${ICON_BASE}/llms.svg` },
  { name: 'Theoretical / Mathematical AI Concepts', icon: `${ICON_BASE}/ai_concepts.svg` },
  { name: 'Node.js & Express.js', icon: `${ICON_BASE}/nodejs.svg` },
  { name: 'Restful APIs & Websockets', icon: `${ICON_BASE}/apis_websockets.svg` },
  { name: 'MongoDB', icon: `${ICON_BASE}/mongodb.svg` },
  { name: 'Git', icon: `${ICON_BASE}/git.svg` },
  { name: 'Docker', icon: `${ICON_BASE}/docker.svg` },
  { name: 'Agile Methodologies', icon: `${ICON_BASE}/agile.svg` },
  { name: 'Problem Solving', icon: `${ICON_BASE}/problem_solving.svg` },
  { name: 'Critical Thinking', icon: `${ICON_BASE}/critical_thinking.svg` },
  { name: 'Effective Communication', icon: `${ICON_BASE}/effective_communication.svg` },
  { name: 'Team Collaboration', icon: `${ICON_BASE}/team_collaboration.svg` },
  { name: 'Time Management', icon: `${ICON_BASE}/time_management.svg` },
  { name: 'Adaptability', icon: `${ICON_BASE}/adaptability.svg` },
  { name: 'Continuous Learning', icon: `${ICON_BASE}/continuous_learning.svg` },
  { name: 'Project Management', icon: `${ICON_BASE}/project_management.svg` },
  { name: 'UI/UX Design', icon: `${ICON_BASE}/ui_ux_design.svg` },
  { name: 'Testing & Debugging', icon: `${ICON_BASE}/testing_debugging.svg` },
  { name: 'Performance Optimization', icon: `${ICON_BASE}/performance_optimization.svg` },
] as const;

export const SKILLS_INTRO =
  'A versatile software engineer and theoretical AI researcher, I specialize in ' +
  'building intelligent, end-to-end systems that seamlessly integrate advanced AI ' +
  'capabilities with modern web technologies.';
