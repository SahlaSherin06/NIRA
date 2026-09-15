"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function ScrollAnimations() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (typeof window === "undefined") return;

    const initAnimations = () => {
      // 1. Reveal Up
      const upElements = gsap.utils.toArray<HTMLElement>('[data-reveal="up"]:not(.gsap-initialized)');
      upElements.forEach((el) => {
        el.classList.add("gsap-initialized");
        gsap.fromTo(el, 
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true }
          }
        );
      });

      // 2. Reveal Left
      const leftElements = gsap.utils.toArray<HTMLElement>('[data-reveal="left"]:not(.gsap-initialized)');
      leftElements.forEach((el) => {
        el.classList.add("gsap-initialized");
        gsap.fromTo(el, 
          { opacity: 0, x: -50 },
          {
            opacity: 1, x: 0, duration: 0.8, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true }
          }
        );
      });

      // 3. Reveal Right
      const rightElements = gsap.utils.toArray<HTMLElement>('[data-reveal="right"]:not(.gsap-initialized)');
      rightElements.forEach((el) => {
        el.classList.add("gsap-initialized");
        gsap.fromTo(el, 
          { opacity: 0, x: 50 },
          {
            opacity: 1, x: 0, duration: 0.8, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true }
          }
        );
      });

      // 4. Scale
      const scaleElements = gsap.utils.toArray<HTMLElement>('[data-reveal="scale"]:not(.gsap-initialized)');
      scaleElements.forEach((el) => {
        el.classList.add("gsap-initialized");
        gsap.fromTo(el, 
          { opacity: 0, scale: 0.94 },
          {
            opacity: 1, scale: 1, duration: 0.8, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true }
          }
        );
      });

      // 5. Fade
      const fadeElements = gsap.utils.toArray<HTMLElement>('[data-reveal="fade"]:not(.gsap-initialized)');
      fadeElements.forEach((el) => {
        el.classList.add("gsap-initialized");
        gsap.fromTo(el, 
          { opacity: 0 },
          {
            opacity: 1, duration: 0.8, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true }
          }
        );
      });

      // 6. Stagger Groups
      const groups = gsap.utils.toArray<HTMLElement>('[data-reveal-group]:not(.gsap-group-initialized)');
      groups.forEach((group) => {
        group.classList.add("gsap-group-initialized");
        const children = Array.from(group.children) as HTMLElement[];
        
        // Exclude elements that shouldn't be animated directly by the stagger
        const validChildren = children.filter(c => !c.hasAttribute('data-reveal'));

        gsap.fromTo(validChildren, 
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.15,
            scrollTrigger: { trigger: group, start: "top 85%", once: true }
          }
        );
      });

      ScrollTrigger.refresh();
    };

    // Run once on mount
    initAnimations();

    // Set up a MutationObserver to watch for newly added elements (e.g. after async fetches complete)
    const observer = new MutationObserver((mutations) => {
      let shouldInit = false;

      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node.nodeType !== 1) continue; // only element nodes
          const el = node as HTMLElement;
          if (
            el.matches?.('[data-reveal], [data-reveal-group]') ||
            el.querySelector?.('[data-reveal], [data-reveal-group]')
          ) {
            shouldInit = true;
            break;
          }
        }
        if (shouldInit) break;
      }
      
      if (shouldInit) {
        // debounce slightly to prevent spamming
        setTimeout(() => {
          initAnimations();
        }, 50);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      document.querySelectorAll('.gsap-initialized').forEach(el => el.classList.remove('gsap-initialized'));
      document.querySelectorAll('.gsap-group-initialized').forEach(el => el.classList.remove('gsap-group-initialized'));
    };
  }, { dependencies: [pathname] });

  return <div ref={containerRef} className="fixed pointer-events-none" style={{ display: 'none' }} />;
}
