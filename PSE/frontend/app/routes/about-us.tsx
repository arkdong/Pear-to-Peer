import type { MetaFunction } from "@remix-run/node";
import styles from 'app/style/about_us.module.css';

// Meta function for setting SEO meta tags specific to the About Us page
export const meta: MetaFunction = () => {
  return [
    { title: "Pear to Peer" },
    { name: "About us", content: "Information about Pear to Peer" },
  ];
};

// AboutUs component renders information about the platform
export default function AboutUs() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "20px" }}>

      <div className={styles.mainContainer}>

        <div className={styles.title}>Learn to code and review</div>

        {/* Container showing statistics related to the platform usage */}
        <div className={styles.statisticsContainer}>
          <div className={styles.statistic}>
            <div className={styles.number}>10+</div>
            <div className={styles.label}>Universities</div>
          </div>
          <div className={styles.statistic}>
            <div className={styles.number}>100+</div>
            <div className={styles.label}>courses</div>
          </div>
          <div className={styles.statistic}>
            <div className={styles.number}>250k+</div>
            <div className={styles.label}>Students</div>
          </div>
        </div>

        {/* Detailed description about the platform */}
        <div className={styles.firstContainer}>
          <div className={styles.title}>
            Pear2Pear
          </div>
            Welcome to <strong>Pear2Pear</strong>, the innovative platform
            where education meets collaboration. Our platform is designed to
            empower students by allowing them to submit their code for peer
            review, and improving their coding skills through receiving and
            providing insightful feedback.
        </div>

        {/* Mission statement of the platform */}
        <div className={styles.secondContainer}>
          <div className={styles.title}>
            Our mission
          </div>
            We believe that peer learning is a powerful tool in developing not
            only coding skills but also critical thinking. Our mission is to
            provide a platform where every student coder can grow by both
            giving and receiving feedback.
        </div>

        {/* Step-by-step explanation of how the platform works */}
        <div className={styles.thirdContainer}>
          <div className={styles.title}>
            How does it work?
          </div>
          <ol>
            <li><strong>Submit Code:</strong> Students submit their assignments or project code.</li>
            <li><strong>Review Code:</strong> Peers review the submissions and provide constructive feedback, aided by insights generated from advanced language learning models.</li>
            <li><strong>Improve:</strong> Everyone learns by discussing and understanding different coding styles and logic.</li>
          </ol>
        </div>

        {/* Benefits of using the platform */}
        <div className={styles.fourthContainer}>
          <div className={styles.title}>
            Benefits
          </div>
          <ul>
            <li>Enhance your coding skills through reviews and tips from your peers.</li>
            <li>Understand various coding approaches and methodologies from fellow students.</li>
            <li>Get to grips with common pitfalls and best practices in coding from real-world examples.</li>
            <li>Develop crucial soft skills like giving and receiving feedback effectively.</li>
          </ul>
        </div>

        {/* Call to action for new users */}
        <div className={styles.fifthContainer}>
          <div className={styles.title}>
          Ready to start?
          </div>
            Join <strong>Pear2Pear</strong> today and revolutionize your
            students learning experience.
        </div>

      </div>

    </div>
  );
}
