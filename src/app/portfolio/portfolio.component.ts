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
    span: string;
    spanSingle?: string;
    imagePath: string;
  }[] = [];
  detailIndex: number = 0;

  constructor() {
    this.mySkills = [
      {
        name: 'Hypertext Markup Language',
        category: ['FRONTEND', 'UI/UX', 'WEB'],
        span: `Hypertext Markup Language * Hypertext Markup Language * Hypertext Markup Language`,
        spanSingle: `HTML`,
        imagePath: 'assets/images/about/html.svg',
      },
      {
        name: 'Cascading Style Sheets',
        category: ['FRONTEND', 'UI/UX', 'WEB'],
        span: `Cascading Style Sheets * Cascading Style Sheets * Cascading Style Sheets`,
        imagePath: 'assets/images/about/css.svg',
      },
      {
        name: 'Java Script',
        category: ['FRONTEND', 'CORE', 'WEB', 'MOBILE'],
        span: `Java Script * Java Script * Java Script`,
        imagePath: 'assets/images/about/javascript.svg',
      },
      {
        name: 'jQuery',
        category: ['FRONTEND', 'WEB'],
        span: `JQuery * JQuery * JQuery`,
        imagePath: 'assets/images/about/jquery.svg',
      },
      {
        name: 'Type Script',
        category: ['FRONTEND', 'BACKEND', 'WEB', 'MOBILE'],
        span: `Type Script * Type Script * Type Script`,
        imagePath: 'assets/images/about/typescript.svg',
      },
      {
        name: 'Angular',
        category: ['FRONTEND', 'CORE', 'PWA', 'SPA', 'WEB'],
        span: `Angular * Angular * Angular`,
        imagePath: 'assets/images/about/angular.svg',
      },
      {
        name: 'React',
        category: ['FRONTEND', 'CORE', 'PWA', 'SPA', 'WEB'],
        span: `React * React * React`,
        imagePath: 'assets/images/about/react.svg',
      },
      {
        name: 'React Native',
        category: ['FRONTEND', 'CORE', 'PWA', 'SPA', 'MOBILE'],
        span: `React Native * React Native * React Native`,
        imagePath: 'assets/images/about/react.svg',
      },
      {
        name: 'Node.js with Express.js',
        category: ['BACKEND', 'CORE'],
        span: `Node.js * Node.js * Node.js`,
        imagePath: 'assets/images/about/nodejs.svg',
      },
      {
        name: 'MongoDB',
        category: ['BACKEND', 'CORE', 'DATABASE'],
        span: `Mongo DB * Mongo DB * Mongo DB`,
        imagePath: 'assets/images/about/mongo.svg',
      },
      {
        name: 'SQL',
        category: ['BACKEND', 'CORE', 'DATABASE'],
        span: `Structured Query Language * Structured Query Language * Structured Query Language`,
        imagePath: 'assets/images/about/sql.svg',
      },
      {
        name: 'C#.NET',
        category: ['BACKEND', 'CORE'],
        span: `C#.NET * C#.NET * C#.NET`,
        imagePath: 'assets/images/about/csharp.svg',
      },
      {
        name: 'Docker',
        category: ['BACKEND'],
        span: `Docker * Docker * Docker`,
        imagePath: 'assets/images/about/docker.svg',
      },
      {
        name: 'Redis',
        category: ['BACKEND'],
        span: `Redis * Redis * Redis`,
        imagePath: 'assets/images/about/redis.svg',
      },
      {
        name: 'Red Hat Enterprise Linux',
        category: ['DEVOPS'],
        span: `Red Hat Enterprise Linus * Red Hat Enterprise Linus * Red Hat Enterprise Linus`,
        imagePath: 'assets/images/about/rhel.svg',
      },
      {
        name: 'PYTHON',
        category: ['BACKEND', 'CORE'],
        span: `Python * Python * Python`,
        imagePath: 'assets/images/about/python.svg',
      },
      {
        name: 'TENSORFLOW',
        category: ['AI', 'CORE'],
        span: `Tensorflow * Tensorflow * Tensorflow`,
        imagePath: 'assets/images/about/tensorflow.svg',
      },
      {
        name: 'GITLAB / GITHUB',
        category: ['VCS'],
        span: `GitLab / GitHub * GitLab / GitHub * GitLab / GitHub`,
        imagePath: 'assets/images/about/git.svg',
      },
      {
        name: 'Subversion',
        category: ['VCS'],
        span: `Sub Version * Sub Version * Sub Version`,
        imagePath: 'assets/images/about/svn.svg',
      }
    ];
  }

  ngAfterViewInit(): void {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      pin: '.psb_gc_left',
      trigger: '.portfolio_section',
      start: 'top -18%',
      end: 'bottom bottom',
    });
    gsap.to(`.pfs_toleft`, {
      x: '-10%',
      scrollTrigger: {
        trigger: '.portfolio_section',
        scrub: true,
        start: 'top bottom',
        end: 'bottom top',
      },
    });
    gsap.to(`.pfs_toright`, {
      x: '10%',
      scrollTrigger: {
        trigger: '.portfolio_section',
        scrub: true,
        start: 'top bottom',
        end: 'bottom top',
      },
    });
  }
}
