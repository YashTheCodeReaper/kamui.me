import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewEncapsulation } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PortfolioComponent implements AfterViewInit {
  mySkills: {
    name: string;
    category: string[];
    span?: string;
    spanSingle?: string;
  }[] = [];

  constructor() {
    this.mySkills = [
      {
        name: 'Hypertext Markup Language',
        category: ['FRONTEND', 'UI/UX', 'WEB'],
        span: `Hypertext Markup <span class="red">Language</span> * Hypertext Markup <span class="red">Language</span> * Hypertext Markup <span class="red">Language</span>`,
        spanSingle: `Hypertext Markup <span class="red">Language</span>`,
      },
      {
        name: 'Cascading Style Sheets',
        category: ['FRONTEND', 'UI/UX', 'WEB'],
      },
      {
        name: 'Java Script',
        category: ['FRONTEND', 'CORE', 'WEB', 'MOBILE'],
      },
      {
        name: 'jQuery',
        category: ['FRONTEND', 'WEB'],
      },
      {
        name: 'Type Script',
        category: ['FRONTEND', 'BACKEND', 'WEB', 'MOBILE'],
      },
      {
        name: 'Angular',
        category: ['FRONTEND', 'CORE', 'PWA', 'SPA', 'WEB'],
      },
      {
        name: 'React',
        category: ['FRONTEND', 'CORE', 'PWA', 'SPA', 'WEB'],
      },
      {
        name: 'React Native',
        category: ['FRONTEND', 'CORE', 'PWA', 'SPA', 'MOBILE'],
      },
      {
        name: 'Node.js with Express.js',
        category: ['BACKEND', 'CORE'],
      },
      {
        name: 'MongoDB',
        category: ['BACKEND', 'CORE', 'DATABASE'],
      },
      {
        name: 'SQL',
        category: ['BACKEND', 'CORE', 'DATABASE'],
      },
      {
        name: 'C#.NET',
        category: ['BACKEND', 'CORE'],
      },
      {
        name: 'Docker',
        category: ['BACKEND'],
      },
      {
        name: 'Redis',
        category: ['BACKEND'],
      },
      {
        name: 'Red Hat Enterprise Linux',
        category: ['DEVOPS'],
      },
      {
        name: 'PYTHON',
        category: ['BACKEND', 'CORE'],
      },
      {
        name: 'TENSORFLOW',
        category: ['AI', 'CORE'],
      },
      {
        name: 'GITLAB / GITHUB',
        category: ['VCS'],
      },
      {
        name: 'Subversion',
        category: ['VCS'],
      },
      {
        name: 'MISCELLANEOUS',
        category: ['BACKEND', 'FRONTEND'],
      },
    ];
  }

  ngAfterViewInit(): void {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      pin: '.psb_gc_left',
      trigger: '.portfolio_section',
      start: 'top -18%',
      end: 'bottom bottom'
    })
  }
}
