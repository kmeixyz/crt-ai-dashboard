import React from "react";
import { motion } from "framer-motion";
import Icon from "../components/Icon.jsx";
import landing from "../styles/Landing.module.css";

const MODULES = [
  { icon: "book", label: "Lesson Plan" },
  { icon: "puzzle", label: "Activity / PBL" },
  { icon: "clipboard", label: "Assessment" },
  { icon: "message", label: "Feedback" },
];

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const gridItemVariant = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Landing({ go }) {
  return (
    <div className={landing.pageWrapper}>
      <div className={landing.pageContent}>
        <section className={landing.hero}>
          <p className={landing.heroHeading}>
            Build culturally responsive STEM materials
            <span className={landing.heroAccent}>in plain language</span>
          </p>
        </section>

        <div className={landing.homeActions}>
          <div className={landing.homeSearchWrap}>
            <div className={landing.searchRow}>
              <span className={landing.searchIcon}>
                <Icon name="sparkles" size="sm" />
              </span>
              <button
                type="button"
                className={landing.searchInput}
                style={{ textAlign: "left", cursor: "pointer" }}
                onClick={() => go("generate")}
              >
                Open the Resource Builder to start a draft…
              </button>
              <button
                type="button"
                className={landing.searchSubmitBtn}
                onClick={() => go("generate")}
              >
                Start
              </button>
            </div>
          </div>

          <section className={landing.quickstart}>
            <div className={landing.quickstartHeader}>
              <h2 className={landing.quickstartTitle}>Resource Builder</h2>
              <button
                type="button"
                className={landing.allMetricsLink}
                onClick={() => go("generate")}
              >
                Open Builder →
              </button>
            </div>
            <motion.div
              className={landing.metricGrid}
              variants={gridVariants}
              initial="hidden"
              animate="visible"
            >
              {MODULES.map((m) => (
                <motion.button
                  key={m.label}
                  type="button"
                  className={landing.metricCard}
                  variants={gridItemVariant}
                  onClick={() => go("generate")}
                >
                  <span className={landing.metricCardFace}>
                    <span className={landing.metricCardIcon}>
                      <Icon name={m.icon} />
                    </span>
                    <span className={landing.metricCardLabel}>{m.label}</span>
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </section>

          <section className={landing.aboutCard}>
            <h2 className={landing.aboutCardTitle}>About the Method</h2>
            <p className={landing.aboutSectionText}>
              Lumen drafts STEM materials from culturally responsive pedagogy, culturally sustaining
              pedagogy, and universal design for learning. Cultural context and accessibility
              supports are part of the workflow, not an afterthought.
            </p>
            <button type="button" className={landing.learnMoreLink} onClick={() => go("learn")}>
              Learn more →
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
