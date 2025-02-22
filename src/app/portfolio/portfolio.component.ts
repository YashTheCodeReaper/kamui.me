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
    spanSingle: string;
    imagePath: string;
    description: string;
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
        description: 'HTML is the foundation of the web, used to structure web content with elements like headings, paragraphs, links, and multimedia. It works seamlessly with CSS and JavaScript for web development.'
      },
      {
        name: 'Cascading Style Sheets',
        category: ['FRONTEND', 'UI/UX', 'WEB'],
        span: `Cascading Style Sheets * Cascading Style Sheets * Cascading Style Sheets`,
        spanSingle: 'CSS',
        imagePath: 'assets/images/about/css.svg',
        description: 'CSS controls the styles of web pages, such as colors, fonts, and layouts, to create responsive and visually appealing designs.'
      },
      {
        name: 'Java Script',
        category: ['FRONTEND', 'CORE', 'WEB', 'MOBILE'],
        span: `Java Script * Java Script * Java Script`,
        spanSingle: 'JS',
        imagePath: 'assets/images/about/javascript.svg',
        description: 'JavaScript adds interactivity and dynamic features to web applications, powering animations, form validations, and more. It runs on both browsers and servers.'
      },
      {
        name: 'jQuery',
        category: ['FRONTEND', 'WEB'],
        span: `JQuery * JQuery * JQuery`,
        spanSingle: '$',
        imagePath: 'assets/images/about/jquery.svg',
        description: 'jQuery is a library that simplifies JavaScript programming for tasks like DOM manipulation, event handling, and animations, reducing code complexity.'
      },
      {
        name: 'Type Script',
        category: ['FRONTEND', 'BACKEND', 'WEB', 'MOBILE'],
        span: `Type Script * Type Script * Type Script`,
        spanSingle: 'TS',
        imagePath: 'assets/images/about/typescript.svg',
        description: 'TypeScript is a typed superset of JavaScript that improves code maintainability with features like static typing and interfaces, making it ideal for large-scale projects.'
      },
      {
        name: 'Angular',
        category: ['FRONTEND', 'CORE', 'PWA', 'SPA', 'WEB'],
        span: `Angular * Angular * Angular`,
        spanSingle: 'ANGULAR',
        imagePath: 'assets/images/about/angular.svg',
        description: 'Angular is a framework for building dynamic single-page applications (SPAs) using TypeScript. It’s perfect for creating scalable, enterprise-grade web apps.'
      },
      {
        name: 'React',
        category: ['FRONTEND', 'CORE', 'PWA', 'SPA', 'WEB'],
        span: `React * React * React`,
        spanSingle: 'REACT',
        imagePath: 'assets/images/about/react.svg',
        description: 'React is a library for building user interfaces with a component-based architecture, ideal for SPAs and PWAs with high performance and flexibility.'
      },
      {
        name: 'React Native',
        category: ['FRONTEND', 'CORE', 'PWA', 'SPA', 'MOBILE'],
        span: `React Native * React Native * React Native`,
        spanSingle: 'RN',
        imagePath: 'assets/images/about/react.svg',
        description: 'React Native enables cross-platform mobile development using React and JavaScript, delivering native-like apps for iOS and Android.'
      },
      {
        name: 'Node.js with Express.js',
        category: ['BACKEND', 'CORE'],
        span: `Node.js * Node.js * Node.js`,
        spanSingle: 'NODE.JS',
        imagePath: 'assets/images/about/nodejs.svg',
        description: 'Node.js is a runtime for building scalable server-side apps, while Express.js is a framework for handling routes and HTTP requests.'
      },
      {
        name: 'MongoDB',
        category: ['BACKEND', 'CORE', 'DATABASE'],
        span: `Mongo DB * Mongo DB * Mongo DB`,
        spanSingle: 'MONGODB',
        imagePath: 'assets/images/about/mongo.svg',
        description: 'MongoDB is a NoSQL database that stores data in JSON-like documents, offering scalability and flexibility for modern applications.'
      },
      {
        name: 'SQL',
        category: ['BACKEND', 'CORE', 'DATABASE'],
        span: `Structured Query Language * Structured Query Language * Structured Query Language`,
        spanSingle: 'SQL',
        imagePath: 'assets/images/about/sql.svg',
        description: 'SQL is used to manage relational databases, enabling efficient data retrieval, updates, and organization.'
      },
      {
        name: 'C#.NET',
        category: ['BACKEND', 'CORE'],
        span: `C#.NET * C#.NET * C#.NET`,
        spanSingle: 'C#.NET',
        imagePath: 'assets/images/about/csharp.svg',
        description: 'C#.NET is a versatile language for building Windows apps, backend services, and web applications within the .NET framework.'
      },
      {
        name: 'Docker',
        category: ['BACKEND'],
        span: `Docker * Docker * Docker`,
        spanSingle: 'DOCKER',
        imagePath: 'assets/images/about/docker.svg',
        description: 'Docker simplifies application deployment by packaging code and dependencies into containers, ensuring consistency across environments.'
      },
      {
        name: 'Redis',
        category: ['BACKEND'],
        span: `Redis * Redis * Redis`,
        spanSingle: 'REDIS',
        imagePath: 'assets/images/about/redis.svg',
        description: 'Redis is an in-memory data store for caching, databases, and message brokering, offering high performance for real-time applications.'
      },
      {
        name: 'Red Hat Enterprise Linux',
        category: ['DEVOPS'],
        span: `Red Hat Enterprise Linus * Red Hat Enterprise Linus * Red Hat Enterprise Linus`,
        spanSingle: 'RHEL',
        imagePath: 'assets/images/about/rhel.svg',
        description: 'RHEL is a stable and secure enterprise-grade Linux distribution, widely used in server environments and DevOps workflows.'
      },
      {
        name: 'PYTHON',
        category: ['BACKEND', 'CORE'],
        span: `Python * Python * Python`,
        spanSingle: 'PY',
        imagePath: 'assets/images/about/python.svg',
        description: 'Python is a simple and versatile language widely used in web development, data analysis, machine learning, and automation.'
      },
      {
        name: 'TENSORFLOW',
        category: ['AI', 'CORE'],
        span: `Tensorflow * Tensorflow * Tensorflow`,
        spanSingle: 'TF',
        imagePath: 'assets/images/about/tensorflow.svg',
        description: 'TensorFlow is an open-source library for building and deploying machine learning models, used in tasks like image recognition and NLP.'
      },
      {
        name: 'GITLAB / GITHUB',
        category: ['VCS'],
        span: `GitLab / GitHub * GitLab / GitHub * GitLab / GitHub`,
        spanSingle: 'GIT',
        imagePath: 'assets/images/about/git.svg',
        description: 'GitLab and GitHub are platforms for version control and collaboration, offering tools for CI/CD and project management.'
      },
      {
        name: 'Subversion',
        category: ['VCS'],
        span: `Sub Version * Sub Version * Sub Version`,
        spanSingle: 'SVN',
        imagePath: 'assets/images/about/svn.svg',
        description: 'Subversion is a centralized version control system used to track changes in code and documents, ensuring collaboration in projects.'
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
