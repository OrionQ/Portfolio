// Tabs.tsx
import React, { Fragment, useState, type ReactNode } from 'react';
import styles from "./Tabs.module.css";

type TabsProps = {
    titles: string[]; // Array of titles for the tabs
    children: ReactNode[]; // Children representing each tab panel's content
};

const Tabs: React.FC<TabsProps> = ({ titles, children }) => {
    const [activeTab, setActiveTab] = useState(0); // State to track the active tab

    return (
        <Fragment>
            {/* Tab Titles */}
            <div className={styles.tabsContainer} role="tablist">
                {titles.map((title, index) => (
                    <button
                        className={styles.tabButton}
                        key={`tab-button-${index}`}
                        onClick={() => setActiveTab(index)}
                        role="tab"
                        aria-selected={activeTab === index ? "true" : "false"}
                    >
                        {title}
                    </button>
                ))}
            </div>
            {/* Tab Panels */}
            {children.map((child, index) => (
                <div
                    key={`tab-content-${index}`}
                    className={activeTab === index ? 'block' : 'hidden'}
                >
                    {child}
                </div>
            ))}

        </Fragment>
    );
};

export default Tabs;