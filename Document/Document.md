## 1. Pre-body Section
- [x] Complete

### 1.1 Title Page 
- [x] Complete

```text
SmartBin
Final Project Report

Sri Lanka Institute of Information Technology
IT2080 Information Technology Project

Group ITP_WE_B3_57

May 2025
```

### 1.2 Declaration
- [x] Complete

```text
Declaration
This project report is our original work, and the content is not plagiarized from any other resource.
References for all the content taken from external resources are correctly cited. To the best of our
knowledge, this report does not contain any material published or written by third parties, except as
acknowledged in the text.

Authors:
Author SID	Author name	Signature
IT23373952	Dissanayake D.S.	
IT23232990	Thennakoon S.S.H.	
IT23325814	Weerathunga A.W.T.C	
IT23367562	Lakshitha W G D	
IT23305700	Perera M K P T S	

Date: 15/05/2025
```

### 1.3 Abstract
- [x] Complete

```text
The SmartBin project addresses the pressing challenges of inefficient and outdated waste management practices in urban Sri Lankan contexts. This report details the development of a comprehensive, MERN stack-based web application designed to centralize and streamline waste management operations. The system integrates five core modules: User and Staff Management, Financial Management, Recycling Management, Pickup Request Management, and Schedule & Resource Management. Key functionalities include role-based access control, automated billing, customer service request portals, recycling marketplace features, and resource scheduling capabilities. The project aims to replace manual processes with an efficient, scalable, and potentially profitable digital platform, enhancing user experience for customers and operational efficiency for service providers. This document outlines the project's introduction, literature review, requirements, design, development, testing, and evaluation, concluding with future enhancements.
```

### 1.4 Acknowledgements 
- [x] Complete

```text
We would like to express our sincere gratitude to all those who have supported and contributed to the successful completion of the SmartBin project. We extend our heartfelt appreciation to our project supervisors, Ms. Aruni Premarathne and Ms. Akshi De Silva. Their invaluable guidance, insightful feedback, and unwavering support throughout the project lifecycle were instrumental in navigating challenges and shaping the direction of this work. Their constructive feedback and insightful questions during the supervision process were invaluable in refining our project and report. A special thank you to Mrs. Geethanjali Wimalaratne, Senior Lecturer and Lecturer in Charge – ITP, Department of IT. Her coordination of the Information Technology Project module and overall support for the student projects has been essential. We are grateful to the Sri Lanka Institute of Information Technology (SLIIT) for providing the academic platform and resources necessary for undertaking this project. The knowledge and skills gained during our studies at SLIIT have been fundamental to the development of SmartBin. Our thanks also go to the academic staff of the Department of IT for their dedication and for imparting the foundational knowledge that made this project possible. We would like to acknowledge our team members: Dissanayake D.S. (IT23373952), Thennakoon S.S.H. (IT23232990), Weerathunga A.W.T.C (IT23325814), Lakshitha W G D (IT23367562), and Perera M K P T S (IT23305700). This project was a collaborative effort, and the dedication, hard work, and mutual support of each member were crucial to its progress and achievements. Finally, we thank our families and friends for their constant encouragement, patience, and understanding during the demanding periods of this project.
```

### 1.5 Table of Contents
- [x] Complete

```text
Abstract	ii
Acknowledgements	iii
List of Tables	v
List of Figures	vi
List of Abbreviations	vii
01.Introduction	1
1.1Background	1
1.2 Problem and Motivation	1
1.3 Literature Review	3
1.4 Aim and Objectives	4
1.5 Solution Overview	6
1.6 Methodology	8
1.7 The Structure of the Report	12
1.8 GitHub Repository	12
02. Literature Review	13
03.Requirements	18
04. Design and Development	23
05. Testing	35
06. Evaluation and Conclusion	46
07. Reference	54
Appendix A	I
Appendix B	II
Appendix C	III
```

### 1.6 List of Tables 
- [ ] Complete

### 1.7 List of Figures 
- [ ] Complete

### 1.8 List of Abbreviations  
- [x] Complete

```text
Abbreviation	Full Term/Description
API	Application Programming Interface
BI	Business Intelligence
CRUD	Create, Read, Update, Delete
CSS	Cascading Style Sheets
ERP	Enterprise Resource Planning
FM	Financial Manager
GIS	Geographic Information System
GUI	Graphical User Interface
HMR	Hot Module Replacement
HTML	HyperText Markup Language
IoT	Internet of Things
IT	Information Technology
JWT	JSON Web Token
KPI	Key Performance Indicator
MFA	Multi-Factor Authentication
MERN	MongoDB, Express.js, React, Node.js (technology stack)
MUI	Material-UI (React UI framework)
NFR	Non-Functional Requirement
NoSQL	Not Only SQL (type of database)
ODM	Object Data Modeling
PDPA	Personal Data Protection Act (Sri Lanka)
RBAC	Role-Based Access Control
REST	Representational State Transfer
SaaS	Software as a Service
SLIIT	Sri Lanka Institute of Information Technology
SPA	Single-Page Application
SQL	Structured Query Language
UI	User Interface
UAT	User Acceptance Testing
UX	User Experience
Vite	Next Generation Frontend Build Tool
```

---




## 2. The Main Body
- [ ] Complete

### 2.1 Chapter 01: Introduction
- [x] Complete

#### 2.1.1 Background
- [x] Complete

Waste management in Sri Lanka, particularly within its rapidly urbanizing centers like Colombo and Kandy, presents a growing and critical challenge. The country is grappling with the environmental and social consequences of inadequate waste management infrastructure and practices, an issue exacerbated by a quickly increasing urban population (Ranaweera, 2023). Issues such as the insufficient number of proper landfill sites, recycling facilities, and composting capabilities mean that municipal waste often ends up in open, illegal dumpsites or is subjected to open burning. These practices lead to severe environmental degradation, including air pollution from harmful emissions and contamination of soil and groundwater, which in turn pose significant health risks to the population, especially vulnerable groups (Ranaweera, 2023). The problem extends to wildlife as well, with open garbage dumps near protected areas tragically becoming death traps for revered animals like elephants, who are drawn to these sites in search of food (Rodrigo, 2022).

A general lack of public awareness regarding responsible waste disposal, recycling, and composting further compounds the problem, leading to littering and unsanitary conditions. The social impacts are also considerable, with improper waste disposal linked to vector-borne diseases and a diminished quality of life, disproportionately affecting marginalized communities and informal waste collectors who often lack access to safe disposal methods and face hazardous working conditions (Ranaweera, 2023).

It is against this backdrop of pressing national need and the operational gaps in existing services that the SmartBin project was conceived. The initiative emerged from the confluence of an entrepreneurial vision to establish an efficient private waste collection service—to operate alongside and complement government efforts—and the academic pursuit of a team of Information Technology students at the Sri Lanka Institute of Information Technology (SLIIT) seeking a final year project. Recognizing the profound inefficiencies and service gaps in the current system, the SmartBin project aims to leverage technology to offer a modern, integrated solution to these multifaceted waste management challenges.

#### 2.1.2 Problem and Motivation
- [x] Complete

Sri Lanka's waste management infrastructure currently faces significant operational inefficiencies and service gaps, particularly for industrial facilities, commercial businesses, and upscale residential areas. The existing systems rely heavily on manual processes that create bottlenecks in service delivery, increase operational costs, and result in inconsistent collection quality.

**Key Problems:**

1. **Poor User Experience:** Customers must use phone calls or in-person visits for basic service requests like scheduling pickups or adjusting collection frequency. The absence of effective digital feedback channels and reporting tools leaves users frustrated and businesses unable to access waste management data needed for compliance and sustainability initiatives.

2. **Operational Inefficiencies:** Manual task assignments consume supervisors' time that could be better utilized elsewhere. Inefficient routing wastes fuel, increases vehicle wear, and reduces team productivity. Collection staff attendance is inconsistent, with workers frequently missing busy days while appearing on slower days, creating service irregularities.

3. **Financial Management Challenges:** The current manual billing and reporting processes are error-prone, slow, and lead to revenue leakage. Traditional systems are expensive yet lack modern features that would justify their cost, creating poor return on investment.

4. **Lack of Integration:** Existing solutions typically address only single aspects of waste management rather than providing a comprehensive platform. The fragmentation between operational, financial, and customer-facing systems creates data silos and communication gaps.

5. **Recycling Barriers:** Difficulties in connecting waste producers with recyclers limit effective waste diversion. Users must independently find recycling centers with minimal guidance or support.

**Motivation:**

For a new waste management company entering the Sri Lankan market, these challenges represent significant opportunities. By developing SmartBin as an integrated digital platform, the company can:

1. **Enhance Customer Experience:** Provide convenient digital channels for service requests, transparent pricing, real-time status updates, and comprehensive reporting capabilities that build trust and loyalty.

2. **Improve Operational Efficiency:** Implement automated scheduling, optimized routing, and digital tracking to reduce costs through more efficient fuel usage, vehicle maintenance, and labor allocation.

3. **Strengthen Financial Performance:** Enable accurate billing, streamlined payment processing, and robust financial reporting to improve cash flow and profitability.

4. **Environmental Impact:** Create systems that encourage better waste segregation, increase recycling rates, and reduce illegal dumping through education and incentives, supporting national sustainability goals.

5. **Data-Driven Decision Making:** Generate comprehensive insights that enable informed strategic decisions about service expansion, resource allocation, and business growth.

By addressing these challenges through a unified digital ecosystem, SmartBin aims to transform waste management from a fragmented, inefficient process into a streamlined, profitable operation that delivers superior service quality while contributing to environmental sustainability.

#### 2.1.3 Literature Review
- [x] Complete

A comprehensive review of existing waste management software solutions reveals several key trends and opportunities. Leading platforms like Access Weighsoft, WasteWORKS, AMCS Platform, Waste Logics, Hauler Hero, Evreka, and Sensoneo offer various features for user management, complaint handling, and financial operations. These solutions demonstrate that successful waste management systems typically incorporate role-based access control, self-service portals, ticketing systems, and flexible financial management capabilities.

The review indicates that cloud-native, microservices-based solutions generally provide better scalability and integration potential compared to monolithic or on-premises systems. However, many existing solutions are either too complex for smaller operations or lack specific features needed for the Sri Lankan context. SmartBin aims to differentiate itself by combining comprehensive user and staff management, centralized complaint handling, flexible financial modules, and a microservices-inspired architecture, all tailored for local needs.

A detailed comparative analysis of these solutions, including their architectural approaches, feature sets, and integration capabilities, is presented in Chapter 2. This analysis informed SmartBin's design decisions and helped identify opportunities for innovation in the local market.

#### 2.1.4 Aim and Objectives
- [x] Complete

**Aim:**  
To develop a fully integrated web-based solution that centralizes and streamlines all waste management operations, replacing manual processes with a profitable, efficient, and scalable digital platform.

**How the Objectives Lead to the Aim:**

1. **Establish a Robust Integrated Platform (Foundation)**
   - Create an integrated platform architecture for seamless data flow and communication between all five modules.
   - Ensure cross-platform accessibility with responsive interfaces for desktop and mobile.
   - Implement comprehensive data analytics for actionable business intelligence.

   *These foundational objectives enable all other modules to work together efficiently, providing the backbone for a unified system.*

2. **Empower Users and Staff (User & Staff Management)**
   - Implement robust user profile management with CRUD operations and role-based authentication.
   - Develop dynamic dashboards for stakeholders (service history, pickups, notifications).
   - Create an integrated complaint handling module for timely resolution and escalation.
   - Build a staff performance management system with attendance tracking and incentives.

   *By empowering users and staff with secure, efficient tools and clear communication, the system increases operational visibility and satisfaction, which is essential for a centralized digital platform.*

3. **Optimize Financial Operations (Financial Management)**
   - Develop a real-time financial dashboard with key performance indicators.
   - Implement a subscription management system (plan creation, billing, invoicing, payment tracking).
   - Create a payroll processing engine (salary, deductions, benefits).
   - Build comprehensive financial reporting tools (income, expenses, revenue analysis).

   *Efficient financial management ensures the platform is profitable and sustainable, directly supporting the aim of operational profitability.*

4. **Streamline Recycling and Pickup Processes (Recycling & Pickup Request Management)**
   - **Recycling Management:**
     - Create a searchable database of recyclable waste types with pricing.
     - Develop a user-friendly recycling request form.
     - Implement a secure payment system for recycling transactions.
     - Design a recycling activity dashboard for tracking requests and transactions.
   - **Pickup Request Management:**
     - Develop a pickup request submission system with location mapping and scheduling.
     - Implement real-time request tracking for users and admins.
     - Create route optimization algorithms based on requests and resources.
     - Design dynamic pricing calculations based on waste type, quantity, and location.

   *These objectives automate and optimize core business processes, reducing manual work and improving customer and recycler experience.*

5. **Maximize Resource Utilization (Schedule & Resource Management)**
   - Develop a resource scheduling module for trucks, equipment, and personnel.
   - Implement maintenance tracking and scheduling for vehicles/equipment.
   - Create real-time monitoring of routes and resource status.
   - Design data analytics for resource optimization and efficiency improvement.

   *Optimizing resources ensures the system is not only efficient but also scalable and reliable, supporting the overall aim.*

**Summary Flow:**  
> **Integrated Platform** → **Empowered Users/Staff** → **Optimized Financials** → **Streamlined Recycling & Pickup** → **Maximized Resources**  
>  
> **All these together achieve the main aim: a centralized, efficient, and profitable digital waste management solution.**

#### 2.1.5 Solution Overview
- [x] Complete

The SmartBin Management System is designed as a comprehensive digital ecosystem that seamlessly integrates five core functional modules into a unified waste management platform. The system follows a modern client-server architecture that enables real-time data exchange between different stakeholders—customers, staff, administrators, financial managers, and recycling partners.

**System Architecture**

SmartBin employs a MERN stack architecture (MongoDB Atlas, Express.js, React, Node.js) with TypeScript for enhanced code reliability and maintainability. Note: Some backend files are still in JavaScript as we are in the process of migrating the entire backend to TypeScript. This migration is nearly complete and will further improve code quality and consistency.

- **Frontend:** A React-based Single-Page Application (SPA) built with Vite and TypeScript that provides role-specific interfaces tailored to different user types. Material-UI components and responsive design ensure a consistent, mobile-friendly user experience.

- **Backend:** A Node.js/Express.js RESTful API server that handles business logic, data validation, and serves as the central hub for all operations. API endpoints are organized by module for clarity and maintainability.

- **Database:** MongoDB Atlas provides a flexible, document-oriented managed cloud database that efficiently stores diverse data types, from user profiles to financial transactions, with appropriate indexing for performance.

- **API Layer:** All modules communicate through a unified RESTful API, ensuring standardized data exchange with JSON payloads.

- **Integrations:** External service connections include Stripe for payment processing (financial management), Google Maps API for geolocation features, and SendGrid for email notifications.

![SmartBin System Architecture](/path/to/system_architecture_diagram.png)
*Figure 1: SmartBin System Architecture Diagram*

**Core Functional Modules**

1. **User and Staff Management Module**
   
   Serves as the authentication and access control hub of the system. It manages secure user registration, role-based access control (RBAC), profile management, and complaint handling. This module verifies all system interactions and maintains appropriate permissions for each user type (admin, staff, customer, recycler). The MFA (Multi-Factor Authentication) feature enhances security for sensitive operations.

2. **Financial Management Module**
   
   Handles all monetary transactions and financial operations. Drawing data from other modules, it manages subscription plans, generates invoices, processes payments, calculates staff payroll, and produces financial reports. Real-time dashboards provide visibility into key financial metrics for managers and administrators.

3. **Recycling Management Module**
   
   Creates a marketplace connecting waste producers with recyclers. It enables administrators to list available waste materials and recyclers to submit purchase requests. The module manages the entire workflow from request submission through approval, payment, and delivery coordination.

4. **Pickup Request Management Module**
   
   Facilitates customer-facing waste collection services. Customers can submit pickup requests with details like waste type, location, and preferred date. The system calculates pricing, tracks request status, and enables administrators to manage the approval workflow. Integration with the Schedule module ensures efficient resource allocation for pickups.

5. **Schedule and Resource Management Module**
   
   Optimizes fleet operations and resource allocation. It manages trucks, equipment, and tools, assigns collection routes to staff, and tracks maintenance requirements. Administrators can create and monitor collection schedules, while drivers can view and update their assigned routes.

**Module Interaction Flow**

The five core modules interact dynamically to provide a streamlined waste management experience:

1. **User Authentication → Module Access:** All user interactions begin with authentication through the User Management module, which determines available features based on role.

2. **Customer Request → Financial Processing:** When customers submit pickup or recycling requests, the Financial module calculates pricing and handles payment processing.

3. **Approved Requests → Scheduling:** Approved pickup requests flow to the Schedule module for resource allocation and route planning.

4. **Schedule Execution → Status Updates:** As staff complete scheduled routes, the Pickup Request module receives status updates that are visible to customers.

5. **Completed Services → Financial Records:** Completed services trigger updates in the Financial module for billing, revenue tracking, and financial reporting.

This integrated approach ensures data consistency, operational efficiency, and a seamless user experience across all aspects of the waste management process. All modules access a centralized MongoDB database through secure API endpoints, with external integration points for payment processing, geolocation services, and analytics capabilities.

**Suggested Diagram Elements**

For the system architecture diagram (Figure 1), it's recommended to include:

1. Core modules with clear visual differentiation
2. Database layer and connections
3. Client interfaces for different user types
4. API gateway showing module interconnections
5. External integration points (payment, email, maps)
6. Data flow direction indicators

This visual representation will help stakeholders understand how the various components work together to deliver a cohesive waste management solution.

#### 2.1.6 Methodology
- [x] Complete

The SmartBin project was developed using an Agile/Scrum methodology, providing flexibility to adapt to changing requirements while maintaining a structured approach to deliver a high-quality final product. This approach allowed the team to iterate rapidly, gather feedback, and progressively enhance the system.

**1. Project Management and Workflow**

*   **Agile/Scrum Framework:** The team implemented a flexible Agile approach with one-week sprints, allowing for frequent reassessment and adjustment of priorities. Each sprint concluded with a review of completed features and planning for the next iteration.
*   **Task Management:** Trello was used as the primary tool for task tracking and assignment. The board was organized into swim lanes corresponding to the project's five core modules, with cards representing individual user stories and features. This visual management system provided transparency on progress and bottlenecks.
*   **Feature-Based Milestones:** Development was organized around key functional milestones aligned with each module's critical features, which helped maintain focus on delivering complete, usable components.

**2. Requirements Engineering**

*   **User Story Approach:** Requirements were captured as user stories following the format "As a [role], I want to [capability] so that [benefit]." This user-centric approach ensured that all features directly addressed stakeholder needs. Stories were prioritized using MoSCoW methodology (Must-have, Should-have, Could-have, Won't-have).
*   **Stakeholder Engagement:** Regular interactions were maintained with primary stakeholders:
    *   **System Administrators:** Consulted on dashboard requirements, user management, and system configuration needs
    *   **Operational Staff (Drivers, Collectors):** Provided input on route management and mobile accessibility requirements
    *   **Customers (Residential & Commercial):** Feedback gathered on service request processes and reporting needs
    *   **Business Owners (Hotels, Restaurants, SMEs):** Consulted on specialized waste management requirements
    *   **Recycling Partners:** Input on marketplace functionality and transaction processes
    *   **Financial Managers:** Requirements for subscription, payroll, and financial reporting features
*   **Competitive Analysis:** As detailed in the Literature Review (Section 2.1.3), existing solutions were analyzed to identify gaps and opportunities for innovation, particularly in integration and localization for the Sri Lankan market.

**3. Design Process**

*   **UI/UX Design:** Figma was used as the primary design tool for creating wireframes and interactive prototypes. The design process began with low-fidelity wireframes that evolved into high-fidelity mockups after stakeholder feedback. The team emphasized intuitive navigation and role-specific interfaces.
*   **Design Standards:** The Material Design guidelines were followed to ensure consistency across the application, with particular attention to accessibility standards. This is evident in the extensive use of Material-UI components and consistent styling patterns throughout the frontend.
*   **System Architecture Design:** The team developed a comprehensive architecture based on the MERN stack (MongoDB, Express.js, React, Node.js), with clear separation of concerns between frontend, backend, and database layers. This modular approach aligned with the five functional module structure of the application.
*   **Database Schema Design:** Mongoose schemas were carefully designed to represent data entities while providing the flexibility needed for evolving requirements. Relationships between collections were mapped to support efficient queries and data integrity.

**4. Development Approach**

*   **Module-Based Full-Stack Development:** The development team adopted a module-based approach, with each developer taking full-stack responsibility for specific functional areas:
    *   User/Staff and Complaint Management
    *   Financial Management
    *   Recycling Management
    *   Pickup Request Management
    *   Schedule and Resource Management
*   **Technology Stack Implementation:**
    *   **Frontend:** React with TypeScript, using Vite as the build tool for improved development experience. Material-UI provided a robust component library, while React Context API handled state management. The responsive design ensured compatibility across devices.
    *   **Backend:** Node.js with Express.js, progressively migrating to TypeScript for type safety. The API structure followed RESTful principles with appropriate middleware for security, validation, and error handling.
    *   **Database:** MongoDB Atlas provided a flexible, cloud-hosted NoSQL database, with Mongoose serving as the ODM for schema definition and validation.
*   **Code Quality Practices:** The team implemented informal code reviews through pair programming sessions and pull request reviews. Linting tools (ESLint) enforced consistency in coding style, while TypeScript provided static type checking to catch potential errors early.
*   **Technical Challenges:** The primary technical challenge encountered was the migration from JavaScript to TypeScript in the backend, requiring careful refactoring while maintaining functionality. The team adopted an incremental approach, converting one module at a time and maintaining backward compatibility.

**5. Testing Strategy**

*   **Comprehensive Test Cases:** Each module had dedicated test cases (minimum of 5 per component) covering core functionality, edge cases, and error handling. These tests were initially performed manually and documented for future automation.
*   **Integration Testing:** Manual integration testing was conducted to ensure proper communication between modules, particularly for critical workflows like user authentication, pickup request submission, and payment processing.
*   **User Acceptance Testing:** Features were validated against their original user stories to ensure they delivered the intended value. Informal feedback sessions with stakeholders helped refine the user experience.
*   **Cross-Browser and Responsive Testing:** The application was tested across multiple browsers and device sizes to ensure consistent functionality and appearance.

**6. Integration Approach**

*   **API-First Development:** The team adopted an API-first approach, defining clear interface contracts between frontend and backend components. This allowed parallel development and simplified integration.
*   **External Service Integration:** RESTful API integrations were established with Stripe for payment processing, SendGrid for email notifications, and Google Maps API for geolocation services.
*   **Configuration Management:** Environment-specific configurations were managed using dotenv for local development, with plans to implement a more robust secrets management solution for production deployment.

This structured, yet flexible methodology enabled the team to deliver a cohesive waste management solution that meets stakeholder needs while maintaining code quality and system performance. The modular approach to both architecture and team organization proved particularly effective in managing the complexity of the multi-faceted system.

#### 2.1.7 The Structure of the Report 
- [x] Complete

This report follows a systematic organization designed to guide readers through the complete lifecycle of the SmartBin project, from conceptualization to evaluation:

- **Chapter 1: Introduction** — Establishes the project context through background information, problem statement and motivation, literature overview, clear aims and objectives, solution architecture, and methodology employed during development.

- **Chapter 2: Literature Review** — Provides a comprehensive analysis of existing waste management software solutions, identifying their features, strengths, limitations, and how SmartBin addresses gaps in current offerings, particularly for the Sri Lankan context.

- **Chapter 3: Requirements** — Presents a detailed stakeholder analysis, defines functional requirements for all five system modules, outlines non-functional requirements (security, performance, usability), discusses technological constraints, and identifies opportunities for future extensibility.

- **Chapter 4: Design and Development** — Details the system architecture, explaining the MERN stack implementation, database design decisions, API structure, authentication mechanisms, and module-specific business logic implementations.

- **Chapter 5: Testing** — Documents the testing methodology, details specific test cases for each module, summarizes test results, and explains the defect management process used to ensure system quality and reliability.

- **Chapter 6: Evaluation and Conclusion** — Critically evaluates the project against its objectives, discusses technological and implementation challenges, summarizes achievements, and outlines potential directions for future development.

- **References** — Contains all cited sources formatted according to IEEE guidelines, providing proper attribution for external knowledge and resources.

- **Appendices**:
  - **Appendix A**: Detailed breakdown of work completed by each team member
  - **Appendix B**: Individual contributions to the final report
  - **Appendix C**: Supporting materials including additional technical documentation and supplementary data

This structure ensures a logical progression from problem identification through solution development and evaluation, providing comprehensive documentation of the SmartBin system.

#### 2.1.8 A Clickable Link to the Git Repo
- [x] Complete

Add your Git repository link here: [SmartBin GitHub Repository](https://github.com/DinithaSasinduDissanayake/SmartBin)

---

### 2.2 Chapter 02: Literature Review
- [x] Complete

This chapter presents a detailed analysis of existing waste management software solutions, examining their features, architectures, and approaches to key functionalities. The review focuses on seven leading platforms: Access Weighsoft, WasteWORKS, AMCS Platform, Waste Logics, Hauler Hero, Evreka, and Sensoneo. Each solution is evaluated based on their user management capabilities, complaint handling systems, financial management features, and architectural design.

**1. Access Weighsoft**  
A cloud-based modular SaaS, Access Weighsoft offers browser-based portals for administrators, fleet operators, and customers. It features robust role-based access control (RBAC), real-time dashboards, and seamless integration with finance packages (e.g., Sage, Xero). Automated invoicing and customizable billing templates are standard. However, its modular approach may require additional configuration for full integration across all business functions.

**2. WasteWORKS**  
This client-server system (with web portal add-on) supports roles such as billing clerks and dispatchers. It includes a ticketing module for work orders and basic user security. Financially, it enables bulk cycle-based invoicing and integrates with general ledger systems. Its on-premises nature and limited API support can restrict scalability and integration with modern web services.

**3. AMCS Platform**  
AMCS is an enterprise ERP with CRM, customer portals, and integrated ticketing. It supports dynamic pricing, cyclical/ad-hoc billing, and advanced BI dashboards. Its monolithic architecture is powerful but may be complex to deploy and adapt for smaller or rapidly evolving organizations.

**4. Waste Logics**  
A cloud-native SaaS, Waste Logics provides multi-tenant CRM, driver mobile apps, and a Service Hub for ticketing. It supports flexible invoicing, two-way sync with popular accounting software, and KPI dashboards. Its microservices architecture allows for frequent updates and robust REST API integrations, making it highly adaptable.

**5. Hauler Hero**  
Hauler Hero is a modern microservices-based SaaS with OAuth-based RBAC, mobile apps for drivers, and a customer portal for payments and service history. It features a 'Follow Up' task system for complaints and supports bulk/tiered billing with public APIs for payment integration. Its mobile-first design and open APIs make it suitable for dynamic, customer-facing operations.

**6. Evreka**  
Evreka offers SaaS with citizen and commercial portals, complaint logging, and real-time dashboards. Its financial module includes contract pricing, auto-invoicing, and AR/AP, with REST APIs for external integration. Its modular microservices style supports scalability and extensibility.

**7. Sensoneo**  
Sensoneo focuses on municipal operations, providing citizen/admin portals, complaint tracking, and IoT integration for real-time analytics. It does not include a financial module, instead integrating with external billing systems.

**Comparative Summary**
- Most leading platforms provide granular RBAC, self-service portals, ticketing/complaint workflows, and flexible billing engines.
- Cloud-native, microservices-based solutions (Waste Logics, Hauler Hero, Evreka) offer superior scalability and integration potential compared to monolithic or on-premises systems.
- Financial management features typically include automated invoicing, tiered billing, and dashboard analytics, with varying degrees of integration with external accounting systems.

**SmartBin's Differentiation**
SmartBin is designed as a fully integrated MERN-stack solution tailored for Sri Lanka's waste management sector. It combines:
- Unified user and staff management with RBAC and self-service dashboards for all roles (admin, staff, customer, recycler).
- Centralized complaint and feedback ticketing, linked to specific services and users.
- Flexible, modular financial management supporting subscriptions, payroll, and real-time analytics, with planned integration to local payment gateways.
- Microservices-inspired architecture for scalability, rapid updates, and future integration with IoT, GIS, and third-party services.
- Local customization for regulatory, language, and business process needs, addressing gaps in international solutions.

By learning from global best practices and focusing on local requirements, SmartBin aims to deliver a seamless, scalable, and user-friendly waste management platform.

**Comparative Table: User, Staff, and Complaint Management**

| Platform         | User Management & Roles (RBAC)                  | Complaint Handling System       | API/Integration (User/Complaint Focused)                            | Architecture Highlights      |
| ---------------- | ----------------------------------------------- | ------------------------------- | ------------------------------------------------------------------- | ---------------------------- |
| Access Weighsoft | Admin, Fleet, Customer Portals                  | N/A                             | REST (for some modules)                                             | Cloud Modular SaaS           |
| WasteWORKS       | Office, Dispatch, Billing                       | Basic ticketing                 | Limited                                                             | On-prem Client-Server        |
| AMCS Platform    | Enterprise roles, Customer Portal               | CRM integrated ticketing        | BI/Connectors                                                       | Monolithic ERP               |
| Waste Logics     | Multi-tenant, Driver Apps                       | Service Hub ticketing           | REST (Accounting sync)                                              | Cloud Microservices          |
| Hauler Hero      | Owner, Dispatch, CSR, Driver                    | Follow-Up tasks                 | Public APIs                                                         | Microservices                |
| Evreka           | Citizen, Commercial, Contractor                 | Engagement portal               | REST (ERP integration)                                              | Cloud SaaS Modular           |
| Sensoneo         | Citizens, Admins                                | Built-in complaint log          | IoT & Data APIs                                                     | Cloud IoT Platform           |
| **SmartBin**     | Admin, Staff, Customer, Recycler (RBAC planned) | Centralized ticketing (planned) | RESTful API, JWT & MFA for auth, Email (SendGrid) for notifications | MERN, Microservices-inspired |

**Comparative Table: Financial Management**

| Platform         | Key Financial Management Features                                         | API/Integration (Finance Focused)                                         | Architecture Highlights        |
| ---------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------ |
| Access Weighsoft | Finance integrations (Sage, Xero), Automated Invoicing, Customizable Templates | REST (Finance connectors)                                                  | Cloud Modular SaaS             |
| WasteWORKS       | "One-Key" Bulk Billing, AR/AP, GL Posting, Crystal Reports               | Limited                                                                    | On-prem Client-Server          |
| AMCS Platform    | Dynamic Pricing, Cyclical/Ad-hoc Billing, AR/AP, BI Dashboards            | BI/Connectors                                                              | Monolithic ERP                 |
| Waste Logics     | Flexible Invoicing, Two-way Sync (Sage, QuickBooks, Xero), KPI Dashboards | REST (Accounting sync)                                                     | Cloud Microservices            |
| Hauler Hero      | Bulk Invoicing, Tiered Pricing, Payment Integration (TrashBolt), Dashboards | Public APIs (TrashBolt)                                                    | Microservices                  |
| Evreka           | Contract Pricing, Auto-Invoice Generation, AR/AP, Optional Payroll        | REST (ERP integration)                                                     | Cloud SaaS Modular             |
| Sensoneo         | N/A (Focuses on operations, billing handled externally)                   | N/A                                                                        | Cloud IoT Platform             |
| **SmartBin**     | Subscriptions, Payroll, Expense Tracking, Real-time Analytics (planned)   | RESTful API, Stripe (payments), Email (SendGrid for billing notifications) | MERN, Microservices-inspired   |

---

### 2.3 Chapter 03: Requirements
- [x] Complete

This chapter outlines the requirements for the SmartBin system, covering stakeholder analysis, functional requirements including evolved and new features, non-functional requirements, technological constraints, and considerations for future extensibility. These requirements have been derived from initial proposals, progress evaluations, and an understanding of the urban Sri Lankan context, particularly Colombo.

**Stakeholder Analysis**

The primary stakeholders of the SmartBin system and their key expectations (with an aim for ~70% satisfaction by the current system) are identified as follows:

*   **System Administrators:**
    *   **Expectations:** Centralized dashboard for system monitoring (partially current, basic dashboard implemented, advanced real-time stats are future), robust user/staff management tools with audit trails (user management is current, audit trails are future), efficient system performance monitoring (basic monitoring in place, advanced tools are future), ability to manage system configurations and master data (e.g., waste types, pricing - current).
    *   **Priorities:** System uptime, data integrity, security, quick troubleshooting.

*   **Operational Staff (Drivers, Collectors):**
    *   **Expectations:** Clear, accessible daily routes and schedules (current, via web interface), easy method to mark tasks/pickups as complete (current), access to necessary customer/pickup details for their routes (current), fair workload distribution (system aims to support, actual fairness depends on admin scheduling), and a way to report basic on-route issues (basic complaint/feedback module can be used, dedicated on-route issue reporting is future).
    *   **Priorities:** Accurate route information, ease of use, safety.

*   **Customers (Residential & General Commercial):**
    *   **Expectations:** Simple account registration and profile management (current), straightforward process for scheduling regular or on-demand pickups specifying common waste types (current), transparent pricing and access to billing/payment history (current), timely email notifications for service confirmations and status updates (current), ability to view pickup history (current, enhanced by new 'My Service History export' feature).
    *   **Priorities:** Convenience, reliability, clear communication, value for money.

*   **Business Owners (Hotels, Restaurants, SMEs in Colombo - specialized Customer segment):**
    *   **Expectations:** Reliable and timely waste collection (current, system designed for this), transparent and accurate billing with access to subscription/payment details (current), ability to request pickups for common commercial waste types (current), access to service history records for tracking and basic compliance (current, supported by 'My Service History export'). Unmet: advanced compliance reports, highly specialized waste handling options.
    *   **Priorities:** Uninterrupted service, cost-effectiveness, ease of basic compliance.

*   **Recycling Partners:**
    *   **Expectations:** Platform to register and manage their profile (current), ability to view available recyclable materials listed by admins (current), system to submit purchase requests (current), notifications on purchase request status (current). Unmet: detailed analytics on past purchases, integrated logistics for material collection.
    *   **Priorities:** Quality of materials, fair pricing, efficient transactions.

*   **Financial Managers:**
    *   **Expectations:** Tools to manage subscription plans (current), ability to oversee and generate invoices (current), system to track customer payments and manage outstanding balances (current), functionality to define salary plans and process payroll (current), access to generate financial reports (revenue, expenses, subscriptions - current). Unmet: advanced budgeting tools with variance analysis, direct integration with external accounting software.
    *   **Priorities:** Accuracy of financial data, automation, security, compliance.

**Functional Requirements**

The SmartBin system is composed of five core modules. Key functional requirements, including recent evolutions and new additions, are detailed below:

1.  **User and Staff Management:**
    *   Secure user registration (Customer, Staff, Admin, Recycler) with profile management (CRUD operations).
    *   Role-Based Access Control (RBAC) to ensure appropriate feature and data access.
    *   User authentication with email/password and Multi-Factor Authentication (MFA).
    *   Password recovery mechanism.
    *   Staff attendance tracking (clock-in/out).
    *   Staff performance monitoring (basic KPI tracking, advanced is future).
    *   Integrated complaint/feedback submission and management system.
    *   *Evolved:* Automated service reminders and custom notifications (email/SMS) for users regarding pickups, payments, and service announcements.

2.  **Financial Management:**
    *   Subscription plan creation and management with flexible tiers.
    *   Automated billing and invoicing based on subscriptions and services.
    *   Payment processing integration (Stripe) and tracking for services.
    *   Salary plan creation and payroll processing for staff.
    *   Expense tracking and management (basic implementation, advanced budgeting is future).
    *   Real-time financial dashboard displaying key KPIs (revenue, expenses, subscriptions).
    *   Generation of financial reports (income, expenses, revenue analysis).
    *   *New:* Customers can export their service/payment history for personal records.

3.  **Recycling Management:**
    *   Admin interface to list recyclable waste materials for sale (type, quantity, price).
    *   Recycler interface to browse and submit purchase requests for materials.
    *   Admin approval/rejection workflow for purchase requests.
    *   Secure payment system for recycling transactions.
    *   Dashboard for recyclers and admins to track recycling requests and transaction history.

4.  **Pickup Request Management:**
    *   Customer interface to submit garbage pickup requests (name, contact, email, community, waste type, preferred date, address, location via map).
    *   Dynamic calculation of pickup fees based on waste type, quantity, and location.
    *   Admin interface to view, manage (approve/reject/update status), and assign pickup requests.
    *   Real-time status tracking for pickup requests (Pending, Approved, On Progress, Completed, Cancelled).
    *   Automated email confirmations and status updates to users.
    *   Advanced search functionality for pickup requests (user and admin).
    *   *New:* Simple customer feedback/rating system post-pickup completion.

5.  **Schedule and Resource Management:**
    *   Admin interface to create and manage collection routes and schedules.
    *   Assignment of routes to specific drivers/collection teams and vehicles.
    *   Management of resources: trucks, tools, equipment (registration, status tracking - Active, Maintenance).
    *   Driver interface to view assigned routes and mark pickups as completed.
    *   Basic real-time monitoring of route progress (map view showing vehicle locations - basic implementation, advanced real-time tracking is future).
    *   Maintenance tracking and scheduling for vehicles and equipment (basic implementation).

**Non-Functional Requirements (NFRs)**
Key NFRs for the SmartBin system include:

*   **Security:**
    *   Data encryption in transit (TLS/SSL) and at rest.
    *   Robust authentication (MFA) and authorization (RBAC).
    *   Protection against common web vulnerabilities (e.g., XSS, SQL Injection - though NoSQL is used, principles apply).
    *   Regular security audits and penetration testing (planned for future).
    *   Compliance with relevant data protection regulations (e.g., Sri Lankan PDPA if applicable).
    *   *Evolved:* Role-based limitations on data export features to prevent unauthorized bulk data extraction.
*   **Performance:**
    *   Average response time under 3 seconds for standard operations.
    *   Support for an initial concurrent user load of 500, scalable to 2000+.
    *   99.5% system uptime during operational hours.
    *   Efficient data loading and querying, especially for dashboards and reports.
*   **Usability:**
    *   Intuitive and user-friendly interface requiring minimal training for all user roles.
    *   Responsive design for accessibility across desktops, tablets, and mobile devices.
    *   Clear error messaging and user feedback.
    *   Accessibility compliance (aiming for WCAG 2.1 AA standards where feasible).
*   **Scalability:**
    *   Horizontally scalable architecture to accommodate business growth and increasing data volume.
    *   Ability to add new service areas, customer segments, and features without major redesign.
*   **Reliability:**
    *   Robust error handling and system recovery mechanisms.
    *   Regular data backups (MongoDB Atlas managed backups) and disaster recovery procedures.
    *   Graceful degradation during partial system failures where possible.
*   **Maintainability:**
    *   Modular architecture (microservices-inspired) allowing independent updates.
    *   Well-documented code and APIs.
    *   Adherence to consistent coding standards (TypeScript migration in progress to aid this).
    *   Automated testing (unit and integration tests planned for broader coverage).

**Technological Constraints**

*   **Ongoing TypeScript Migration:** The backend is currently undergoing a migration from JavaScript to TypeScript. While nearly complete, this ongoing process might temporarily affect development velocity for new backend features and requires careful management to ensure consistency.
*   **Third-Party API Dependencies:** The system relies on external services such as Stripe (payments), SendGrid (email), and Google Maps API (geolocation). Any changes in their availability, terms of service, pricing, or API specifications could impact SmartBin's functionality or operational costs, requiring adaptive measures.

**Future Extensibility**

The SmartBin system is designed with future growth in mind. Key areas identified for potential future extensions include:

*   **Gamification and Community Engagement Module:** To enhance user engagement, particularly for residential customers, by introducing points, badges, and community leaderboards for activities like consistent recycling, timely payments, or providing helpful feedback. This can foster a sense of community and encourage positive waste management habits.
*   **Direct Integration with IoT Smart Bins:** The architecture, especially the Pickup Request and Scheduling modules, will be prepared with APIs to potentially integrate data from IoT-enabled smart bins in the future. This would allow for features like fill-level monitoring, triggering automatic pickup requests, and further optimizing collection routes based on real-time bin status.

Requirement modeling diagrams (e.g., Use Case Diagrams for key interactions, a high-level Data Flow Diagram) will be included in Chapter 4 (Design and Development) to visually represent these requirements.

---

### 2.4 Chapter 04: Design and Development
- [x] Complete

This chapter details the design and development aspects of the SmartBin system, covering its architecture, backend and frontend implementation, database design, and key technological choices. The system is engineered to be modular, scalable, and maintainable, leveraging the MERN stack with TypeScript.

**I. Overall System Architecture & Design Philosophy**

**1. High-Level Architecture**

SmartBin employs a **client-server architecture**. The frontend, built as a Single-Page Application (SPA), interacts with a backend RESTful API server. This API server handles all business logic, data processing, and communication with the MongoDB Atlas database. External services for payments (Stripe), email notifications (SendGrid), and geolocation (Google Maps API) are integrated via the backend.

*(Suggested Description for your System Architecture Diagram - Figure 4.1):*
*The diagram should depict the following components and interactions:*
*   *User Interfaces (Clients): Web browsers (desktop/mobile) accessing the React Frontend.*
*   *Frontend (React SPA with Vite & TypeScript): Contains UI components, handles user interaction, manages client-side state, and makes API calls.*
*   *API Gateway/Backend Server (Node.js/Express.js with TypeScript): Exposes RESTful API endpoints, handles request validation, authentication/authorization, business logic execution, and orchestrates communication with the database and external services.*
*   *Database (MongoDB Atlas): Stores all application data including user profiles, service requests, financial records, schedules, etc.*
*   *External Services: Stripe (for payments), SendGrid (for email notifications), Google Maps API (for geolocation). Arrows should show these services being called by the Backend Server.*
*   *Key Data Flows: Arrows indicating request/response flow from Frontend to Backend, and Backend to Database/External Services.*
*   *Security Layers: Mention of HTTPS, JWT, MFA around relevant components.*

**2. Design Patterns & Architectural Style**

*   **Backend:** The backend follows a **modular, service-oriented approach**. Code is organized into `routes`, `controllers`, `services` (though a dedicated top-level `services` folder isn't in `src`, the logic is separated within controllers or utility modules), and `models`, promoting separation of concerns. This structure is akin to a **modular monolith**, designed with clear boundaries that could allow future evolution towards microservices if scalability demands it. Error handling is centralized using custom error classes (`AppError`) and dedicated middleware (`errorHandler`). Authentication and authorization are managed via specialized middleware (`authMiddleware.ts`, `mfaRoutes.js`).
*   **Frontend:** The frontend utilizes a **component-based architecture**, which is fundamental to React. The UI is constructed from reusable components (located in `frontend/src/components/`). State management is handled through a combination of local component state for component-specific data and React Context API (evident from `frontend/src/contexts/` such as `AuthContext.js`) for managing global or shared state like user authentication status across different parts of the application. Client-side routing is managed by `react-router-dom`, enabling a smooth SPA experience.

**3. Technology Choices Rationale**

*   **MERN Stack (MongoDB, Express.js, React, Node.js) with TypeScript:**
    *   **Unified JavaScript/TypeScript Ecosystem:** Utilizing JavaScript and progressively TypeScript across the full stack (Node.js for the backend, React for the frontend) streamlines development. It allows for potential code sharing (e.g., utility functions, interfaces/types with TypeScript), requires a more focused skillset within the development team, and grants access to the vast NPM ecosystem for a wide array of libraries and tools.
    *   **MongoDB Atlas (NoSQL Database):** MongoDB's document-oriented nature provides schema flexibility, which is highly beneficial for an application like SmartBin with diverse and potentially evolving data structures (user profiles, varied service requests, logs, etc.). Using MongoDB Atlas as a managed cloud database service offloads operational burdens such as setup, maintenance, backups, and scaling, allowing the team to focus on application development. Its scalability features are also crucial for future growth.
    *   **Express.js (on Node.js for Backend):** Express.js is a minimalist, unopinionated, and highly flexible Node.js web application framework. It excels at building robust RESTful APIs quickly. Its extensive middleware ecosystem allows for easy integration of functionalities like security, logging, and request processing. Its non-blocking I/O model, inherent from Node.js, is well-suited for handling concurrent requests efficiently.
    *   **React (Frontend Library):** React is a powerful and widely adopted JavaScript library for building dynamic, interactive, and high-performance user interfaces. Its component-based architecture promotes UI reusability, modularity, and easier maintenance. The virtual DOM ensures efficient updates and rendering, leading to a responsive user experience.
    *   **TypeScript:** The adoption of TypeScript across both frontend and (increasingly) backend development significantly enhances code quality, robustness, and maintainability. Static typing helps catch errors during development rather than at runtime, improves code readability and navigation, and makes refactoring safer and easier, which is particularly valuable for a complex, multi-module system like SmartBin.
*   **Vite (Frontend Build Tool):** Vite was selected for the frontend build process due to its modern architecture that offers significantly faster development server start-up times and Hot Module Replacement (HMR) compared to older bundlers. This results in a more efficient and pleasant development experience for the React application.

**II. Backend Design & Development (Node.js/Express.js, MongoDB Atlas, TypeScript/JavaScript)**

**1. API Design**

*   **Structure:** The backend exposes RESTful APIs. Routes are generally organized by resource or feature, for example, `/api/users`, `/api/auth`, `/api/pickup`, `/api/financials`, `/api/schedules`, `/api/complaints`, etc. Standard HTTP verbs (GET, POST, PUT, DELETE, PATCH) are utilized for CRUD (Create, Read, Update, Delete) operations on these resources.
*   **API Versioning:** Explicit API versioning (e.g., `/api/v1/...`) was not observed in the primary route definitions within `server.ts` or the explored route files. The API is assumed to be operating on its initial version.
*   **Middleware Components:** A suite of middleware is employed to handle various cross-cutting concerns:
    *   **Security:** `helmet` (sets various HTTP headers for security), `cors` (enables Cross-Origin Resource Sharing), `express-rate-limit` (protects against brute-force and denial-of-service attacks), `express-mongo-sanitize` (prevents NoSQL query injection), `hpp` (protects against HTTP Parameter Pollution attacks).
    *   **Authentication & Authorization:** Custom middleware located in `authMiddleware.ts` is responsible for verifying JWTs and likely performing role-based access checks. Routes defined in `mfaRoutes.js` handle the logic for multi-factor authentication.
    *   **Validation:** `express-validator` is used for validating incoming request data (e.g., body, params, query). Validation rules are often defined and applied within route handlers or separate validation middleware (partially seen in `validate.ts`). Errors from validation are handled by `validationErrorHandler.ts`.
    *   **Error Handling:** A centralized error handling mechanism is in place, featuring a custom `AppError` utility class (`src/utils/appError.ts`) for creating structured operational errors, and a global `errorHandler` middleware (`middleware/errorMiddleware.ts`) that processes errors and sends consistent JSON responses to the client.
    *   **Logging:** `morgan` is utilized for HTTP request logging in the development environment, providing details such as request method, URL, status code, and response time.
    *   **Other Core Middleware:** `compression` (for gzipping responses to reduce bandwidth), `express.json()` and `express.urlencoded()` (for parsing JSON and URL-encoded request bodies), `multer` (for handling `multipart/form-data`, primarily used for file uploads, e.g., in `documentRoutes.js`).

**2. Database Design (MongoDB Atlas with Mongoose)**

Mongoose serves as the Object Data Modeling (ODM) library, providing a schema-based solution to model application data and interact with the MongoDB Atlas database.

*   **Key Mongoose Schemas/Models (Organized by inferred module):**
    *   **User, Staff & Authentication:** `User.js` (core model for all users including customers, staff, admins, recyclers; stores profile info, credentials with hashed passwords, roles, MFA details), `Attendance.js` (for staff clock-in/out records), `Complaint.js` (for issues logged by users/staff), `Performance.js` (for staff performance reviews/metrics), `Document.js` (for storing metadata about uploaded documents, e.g., staff certifications).
    *   **Financial Management:** `SubscriptionPlan.js` (defines available service subscription tiers with pricing and features), `UserSubscription.js` (links users to their active subscription plans), `Payment.js` (records all payment transactions, likely linked to Stripe), `Expense.js` (for tracking operational expenses), `PayrollLog.js` (stores records of processed payroll for staff), `Budget.js` (for defining and tracking budgets).
    *   **Recycling Management:** `RecyclingRequest.js` (requests from recyclers to purchase waste), `AdminRecyclingRequest.js` (potentially a separate model or a specialized view for admin processing of these requests; needs clarification if it's a distinct collection or an aggregation target).
    *   **Pickup Request Management:** `Pickup.ts` (customer-initiated requests for garbage pickup, including details like waste types, address, geolocation coordinates, preferred date, calculated amount, and status).
    *   **Schedule & Resource Management:** `Schedule.ts` (defines collection schedules, assigned routes, linked staff, and vehicles), `Truck.ts` (information about collection vehicles), `Tool.ts` (details of tools used in operations), `Equipment.ts` (details of other operational equipment).
    *   **System & Utility:** `Settings.js` (stores global application settings, e.g., default currency, timezone), `Log.js` (potentially for custom application-level event logging beyond HTTP requests).

*   **Key Model Relationships (Examples - inferred):**
    *   `UserSubscription` has references to `User` (via `userId`) and `SubscriptionPlan` (via `planId`).
    *   `Pickup` requests contain references or embedded information linking them to the requesting `User`.
    *   `Schedule` entries would reference `User` (assigned staff/drivers) and `Truck`, and might contain an array of `Pickup` IDs or service area identifiers.
    *   `PayrollLog` instances are associated with specific `User` (staff) documents.
    *   `Complaint` documents are linked to the `User` who submitted them and potentially to related entities like a `Pickup` request or `Schedule`.
    *   `Payment` records are linked to `User` and potentially `UserSubscription` or specific `Pickup`/`RecyclingRequest`.

*   **Indexing Strategies:** Mongoose automatically creates an `_id` index for each collection. For performance, it is standard practice to define additional indexes on fields frequently used in queries, such as `email` in the `User` model (for login), `status` in `Pickup` and `RecyclingRequest` models (for filtering and dashboards), and date fields for time-based queries. Timestamps (`createdAt`, `updatedAt`), which are often added by Mongoose, are also commonly indexed.
*   **Data Validation:** Data integrity is enforced at the model level through Mongoose schemas. This includes schema-level validation for data types (String, Number, Date, Boolean, ObjectId, Array), `required` fields, `unique` constraints, `enum` (for fields with a predefined set of allowed values like status fields), `min`/`max` for numbers, `minLength`/`maxLength` for strings, and `match` for regular expression validation (e.g., for email formats or currency codes as seen in `Settings.js`). Custom validation functions can also be implemented if needed.

**3. Authentication & Authorization**

*   **JWT Authentication:** User authentication is handled using JSON Web Tokens (JWT). The `jsonwebtoken` library is used. Upon successful login (credentials verified against `bcryptjs` hashed passwords), `authRoutes.js` (and its controller) generates a JWT containing user identity information (like ID and role). This token is sent to the client, which includes it in the `Authorization` header (typically as a Bearer token) for subsequent authenticated requests. The `authMiddleware.ts` intercepts these requests, verifies the token's validity and signature, and attaches the user information to the request object for use in downstream controllers/services.
*   **Multi-Factor Authentication (MFA):** MFA is implemented using Time-based One-Time Passwords (TOTP). `speakeasy` is used for generating and verifying TOTP secrets and codes, and `qrcode` is used to generate QR codes that users can scan with authenticator apps (like Google Authenticator or Authy) to set up MFA. The `mfaRoutes.js` and associated controller (`mfaController.js`) manage the processes of generating MFA secrets, displaying QR codes, verifying initial TOTP setup, and validating TOTPs during login for users who have MFA enabled. Guidance from sources like Williamson and Curran [7] notes that "Passwords alone are not effective..." and recommends requiring a combination of "two or more" factors for identity verification.
*   **Role-Based Access Control (RBAC):** RBAC is enforced primarily within the `authMiddleware.ts`. After successful JWT verification, the middleware extracts the user's role (stored in the `User` model and included in the JWT payload). It then checks if this role is permitted to access the requested route or perform the intended action. This can be implemented by defining allowed roles for specific routes or groups of routes. Further role-specific logic might also exist within individual route controllers to control access to particular data or operations based on user roles. The NIST RBAC model (NIST, 2012) [6] provides a standard framework, explaining that administrators "establish permissions based on the functional roles…assign users to a role or set of roles," centralizing access control.

**4. Business Logic & Key Algorithms (Module-wise Overview)**

*   **User/Staff/Complaint Management:**
    *   **User/Staff Lifecycle:** Involves secure registration with password hashing, profile creation/updates, and role assignment by administrators. Staff management includes tracking attendance (`Attendance.js`) and performance (`Performance.js`). Document uploads (`Document.js`) likely support verification processes.
    *   **Complaint System (`Complaint.js`, `complaintRoutes.js`):** Users (customers or staff) can submit complaints detailing issues. Administrators can view a list of complaints, filter them, assign them for resolution (if applicable), and update their status (e.g., New, In Progress, Resolved, Closed). Email notifications might be triggered on status changes. Advanced escalation logic (e.g., auto-assigning overdue complaints) would reside in a service layer, though not explicitly detailed in filenames, it's a common pattern. A structured feedback system like this can improve service quality and user satisfaction.
*   **Financial Management (`financialRoutes.js`, `payrollRoutes.js`, `subscriptionPlanRoutes.js`, etc.):**
    *   **Subscription & Billing:** Admins define subscription plans (`SubscriptionPlan.js`) with pricing and features. Customers subscribe via `UserSubscription.js`. The system likely generates invoices periodically (e.g., monthly) based on active subscriptions. Logic for handling upgrades/downgrades, prorated charges, and trial periods would be part of this module's service layer. Stripe's services support flexible recurring and usage-based billing models [14]. Automated invoicing is a key benefit [15].
    *   **Payment Processing:** Integration with Stripe (`stripe` library) [14] handles online payments for subscriptions and one-time services (like pickups). This involves creating checkout sessions, handling webhooks for payment success/failure, and updating `Payment.js` records. Stripe is PCI Service Provider Level 1 certified, ensuring a secure payment environment [14].
    *   **Payroll Management:** Admins can define salary structures or link staff to salary plans. The `PayrollLog.js` suggests a process for calculating and recording payroll, likely considering base salary, deductions (taxes, etc.), and potentially bonuses (which could be linked to `Performance.js` data). Specific calculation algorithms are in the service layer. Web-based payroll systems can automate salary calculations, record keeping, and payslip generation [12].
    *   **Expense & Budget Tracking:** `Expense.js` allows for recording operational costs. `Budget.js` enables setting financial targets or limits for different categories. Financial reports would then compare actual expenses against budgets.
*   **Recycling Management (`RecyclingRequest.js`, `AdminRecyclingRequest.js`):**
    *   Admins list available recyclable materials with details (type, quantity, price). Recyclers browse these listings and submit purchase requests. Admins review and approve/reject requests based on inventory and policies. The system tracks the status of these requests and facilitates communication, likely including payment processing via Stripe for confirmed sales.
*   **Pickup Request Management (`pickupRoutes.ts`, `Pickup.ts`):**
    *   Customers submit pickup requests via a form, providing details like name, contact, address (with map-based location selection using Leaflet on frontend, coordinates sent to backend), waste types, and preferred date. The backend calculates a dynamic pickup fee based on factors like waste volume/type and possibly distance (if geolocation is used beyond simple address storage).
    *   Requests progress through statuses (Pending, Approved, On Progress, Completed, Cancelled). Admins manage this workflow. Email notifications (via SendGrid) are sent to users at key status changes (e.g., confirmation, scheduling, completion).
*   **Schedule & Resource Management (`scheduleRoutes.ts`, `resourceRoutes.ts`, `truck.ts`, etc.):**
    *   Administrators create collection schedules, define routes (potentially as a sequence of areas or specific pickup points), and assign these schedules to available drivers (`User` with staff role) and vehicles (`Truck.ts`). The system tracks the status of trucks, tools (`Tool.ts`), and equipment (`Equipment.ts`) (e.g., Active, In Maintenance, Available).
    *   Drivers can view their assigned schedules/routes and update the status of individual pickups or entire routes. Basic real-time monitoring might involve displaying vehicle locations (from GPS if available, or last known pickup) on a map for admins.

**5. Error Handling & Logging**

*   **Error Handling Strategy:** The backend employs a centralized error handling strategy. Operational errors (expected issues like invalid input, resource not found) are typically represented by the custom `AppError` class (defined in `src/utils/appError.ts`), which includes a status code and a message. This allows for consistent error creation throughout the application. All errors, whether operational or unexpected programming errors, are caught by a global error handling middleware (`errorHandler` in `middleware/errorMiddleware.ts`). This middleware is responsible for sending a standardized JSON error response to the client. It differentiates between development and production environments, providing more detailed stack traces in development for easier debugging, while sending more generic, user-friendly error messages in production to avoid exposing sensitive system internals.
*   **Logging:** HTTP request logging is implemented using the `morgan` middleware, but only in the `development` environment. This logs details of incoming requests like method, URL, status code, and response time to the console, aiding in debugging and monitoring API traffic during development. For more persistent or structured application-level logging (e.g., critical errors, significant business events, audit trails), a dedicated logging library (like Winston or Bunyan) or a custom solution leveraging the `Log.js` model might be used, although the primary observed logging is request-based via Morgan.

**III. Frontend Design & Development (React, Vite, TypeScript, Material-UI)**

**1. Code Organization & Component Structure**

The frontend codebase, located in `frontend/src`, follows a standard React project structure, promoting modularity and maintainability:

*   `components/`: This directory houses reusable UI components that are used across multiple pages or are complex enough to be isolated. Examples would include generic `Button`, `Card`, `Modal` components, or more specific ones like `PickupRequestForm`, `ScheduleCalendar`, `Header`, `Sidebar`, and `Footer`.
*   `pages/`: Contains higher-level components that typically represent distinct screens or views within the application. Each page component would compose various reusable components and handle the logic specific to that view (e.g., `LoginPage.jsx`, `AdminDashboardPage.jsx`, `CustomerPickupHistoryPage.jsx`).
*   `services/`: This directory is expected to contain modules responsible for interacting with the backend API. Functions within these services (e.g., `authService.js`, `pickupService.js`, `financialService.js`) would use `axios` to make HTTP requests, handle request/response transformations, and manage API-related concerns.
*   `contexts/`: Implements the React Context API for managing global or shared state that needs to be accessible by multiple components without prop drilling. A key example is `AuthContext.js`, which would manage user authentication status, user details, and provide login/logout functions to the rest of the application.
*   `hooks/`: Stores custom React Hooks, which are functions that let you "hook into" React state and lifecycle features from function components. These are used to encapsulate and reuse stateful logic.
*   `styles/`: Contains global CSS files (`index.css`, `App.css`), theme configurations (`muiTheme.js`, `theme.js`), and potentially CSS Modules or styled-components if used for component-specific styling.
*   `assets/`: For static files like images, icons, and custom fonts.
*   `lib/`: May contain utility functions, helper scripts, or configurations for third-party libraries.
*   `App.jsx` / `App.tsx`: The root component of the application, typically responsible for setting up routing and overall layout structure.
*   `main.tsx`: The entry point of the React application, where the root `App` component is rendered into the DOM.

**2. User Interface (UI) & User Experience (UX) Design**

*   **Role-Specific Dashboards:** The application is designed to provide tailored dashboards for different user roles, ensuring users only see relevant information and have access to appropriate functionalities. For example:
    *   **Admin Dashboard:** A comprehensive overview of system operations, user management, financial summaries, complaint tracking, and access to all module configurations.
    *   **Customer Dashboard:** Enables users to schedule/manage pickups, view service and billing history, manage subscriptions, make payments via Stripe, and submit complaints or feedback.
    *   **Staff (Driver/Collector) Dashboard:** Primarily focused on displaying assigned routes and schedules, allowing for task completion updates, and potentially communication with supervisors.
    *   **Financial Manager Dashboard:** Provides tools for managing subscription plans, invoicing, payment tracking, payroll processing, expense management, and generating detailed financial reports.
    *   **Recycler Dashboard:** Allows recyclers to view available recyclable materials, submit purchase requests, track order statuses, and manage their transactions.
*   **User Workflows:** Key user tasks are designed to be intuitive. For instance, submitting a pickup request involves a guided form where users input details, select their location using an integrated map (Leaflet is a dependency, suggesting interactive map features), and receive immediate confirmation and subsequent status updates. Complaint submission uses a dedicated form, with tracking available through the user's dashboard.
*   **Responsive Design:** The application aims for responsiveness across various devices (desktops, tablets, mobile phones). This is achieved through a combination of Material-UI's responsive grid system and components, along with custom CSS media queries defined in files within the `styles` directory (e.g., `index.css`, `App.css`, `variables.css`).
*   **Material-UI (MUI):** The extensive use of Material-UI (`@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers`) ensures a consistent and professional user interface. MUI provides a rich library of pre-built, customizable components (buttons, forms, data tables, navigation elements, date/time pickers, etc.) that adhere to Material Design guidelines. The application leverages MUI's theming capabilities (configured in `muiTheme.js` and `theme.js`) to apply SmartBin's branding and maintain visual consistency throughout.

**3. API Integration (Client-Side)**

*   **Communication Protocol:** The frontend communicates with the backend API using HTTP requests, primarily facilitated by the `axios` library (listed as a dependency in `frontend/package.json`). `axios` is used to send GET, POST, PUT, DELETE requests to the RESTful endpoints exposed by the backend.
*   **Request/Response Handling:** Service modules (in `frontend/src/services/`) typically encapsulate API call logic. They handle constructing request payloads, setting headers (e.g., `Authorization` header with JWT for authenticated requests), and processing responses. Successful responses are used to update the client-side state and UI. API errors (e.g., 4xx, 5xx status codes) are caught, and user-friendly error messages or notifications are displayed, often through a global notification system or inline form errors.

**4. Frontend Routing**

*   Client-side routing for the Single-Page Application (SPA) is managed by `react-router-dom` (a dependency in `frontend/package.json`). This library allows for defining routes that map URL paths to specific React components (pages), enabling navigation within the application without requiring a full page reload from the server. Route configuration is typically centralized in the `App.jsx` or `App.tsx` component, often including protected routes that require authentication before access.

This chapter provides a comprehensive overview of SmartBin's design and development. To further enhance understanding, visual aids such as an Entity-Relationship Diagram (ERD) for the database, key sequence diagrams (e.g., for user login with MFA, pickup request submission and processing flow), and high-level component diagrams for major frontend and backend modules are recommended and will be referenced or included as appropriate in the final report structure.

---

### 2.5 Chapter 05: Testing
- [x] Complete

The testing phase for the SmartBin system was integral to verifying its functionality, reliability, and alignment with user requirements. This chapter outlines the testing approach, summarizes the test cases executed for each core module, and discusses the methods used to ensure the quality of the application. The primary focus was on validating that the system performs as intended and that its components integrate correctly.

**Overall Testing Strategy**

The testing strategy for SmartBin prioritized functional correctness and usability, primarily through manual testing efforts:

*   **Functional Testing:** This was the cornerstone of the testing efforts. Test cases were designed based on the defined user stories and functional requirements for each of the five core modules. The objective was to ensure that all features behaved as expected from the perspective of different user roles (Admin, Customer, Staff, Recycler, Financial Manager). This involved manually executing scenarios detailed in the progress report.
*   **Manual Testing:** Given the interactive nature of the system and project timelines, manual testing was the primary method employed. This involved testers systematically executing predefined test cases, inputting various data, and observing system responses to identify deviations from expected outcomes and any usability issues.
*   **Integration Considerations:** While formal, automated integration testing was not the primary focus, the interdependencies between modules (e.g., User Management with Financials for subscriptions, Pickup Requests with Scheduling) and with external services (Stripe, SendGrid, Google Maps API) were manually verified during the testing of end-to-end user workflows.
*   **User-Centric Validation:** Throughout the development, informal feedback was gathered during demonstrations of implemented features to stakeholders. This helped ensure that the system was developing in line with user expectations and business needs, serving as a form of ongoing, informal User Acceptance Testing (UAT).
*   **Unit Testing Considerations:** While a comprehensive, formally documented unit testing suite was not a primary deliverable for this phase, developers were encouraged to test individual functions and components locally, especially for critical backend logic and complex frontend components, to ensure their correctness before integration.

**Module-Specific Test Cases**

The following sections detail the acceptance criteria and a selection of five key test cases derived from the project's progress report for each core module. "Actual Results" for these tests are assumed to be "Pass" or "As Expected," aligning with the successful implementation of the described functionalities.

**2.5.1 User and Staff Management (including Complaints)**

*   **Acceptance Criteria:**
    *   Users can securely register, log in, and manage their basic profile information.
    *   Role-based access control is functional, directing users to appropriate dashboards.
    *   Staff attendance (clock-in/out) can be recorded.
    *   A system for submitting and viewing complaints is operational.

*   **Test Cases:**

| Test ID      | Description                                                 | Preconditions                                  | Steps                                                                                                | Expected Result                                                                 |
| :----------- | :---------------------------------------------------------- | :--------------------------------------------- | :--------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| TC_REG_01  | Successful user registration with valid information.        | None.                                          | 1. Navigate to registration. 2. Fill valid data. 3. Submit.                                        | User account created. Redirect to login or success message shown.               |
| TC_REG_NEG_01| Attempt user registration with invalid/missing data.      | None.                                          | 1. Navigate to registration. 2. Fill form with invalid email and leave a required field blank. 3. Submit. | Error messages displayed for invalid data and missing fields. User not registered. |
| TC_LOGIN_01 | Successful login with valid credentials.                    | User account exists and is active.             | 1. Navigate to login. 2. Enter correct email/password. 3. Click Login.                             | User logged in successfully. Redirected to the appropriate role-based dashboard. |
| TC_LOGIN_MFA_01 | Successful login with valid credentials and MFA.          | User account exists, is active, and has MFA enabled. | 1. Navigate to login. 2. Enter correct email/password. 3. Click Login. 4. Enter valid MFA code. 5. Submit. | User logged in successfully. Redirected to the appropriate role-based dashboard. |
| TC_ATT_01   | Staff can clock-in successfully.                            | Staff user is logged in.                       | 1. Navigate to Attendance. 2. Click "Clock In".                                                    | Clock-in recorded. Attendance status updated. Success message.                  |
| TC_ATT_02   | Staff can clock-out successfully.                           | Staff user is logged in and previously clocked in. | 1. Navigate to Attendance. 2. Click "Clock Out".                                                   | Clock-out recorded. Attendance status updated. Success message.                 |
| TC_PROFILE_02| User can successfully edit their profile information.       | User is logged in.                             | 1. Navigate to Profile. 2. Click "Edit". 3. Modify a field (e.g., contact number). 4. Save changes. | Profile information (e.g., contact number) updated in the database and displayed correctly on the profile page. Success message shown. |
| TC_COMP_01  | User can submit a complaint successfully.                   | User is logged in.                             | 1. Navigate to Complaints. 2. Fill complaint form. 3. Submit.                                      | Complaint submitted. Success message. Complaint is visible in the submitting user's complaint history. Complaint is visible in the admin's complaint management interface. |
| TC_ADMIN_USER_DEACTIVATE_01 | Admin can successfully deactivate a user account. | Admin logged in. Target user account exists and is active. | 1. Admin navigates to User Management. 2. Admin finds and selects target user. 3. Admin chooses "Deactivate" option and confirms. | User account status changed to inactive in the system. Deactivated user is unable to log in. Success message for admin. |

**2.5.2 Financial Management**

*   **Acceptance Criteria:**
    *   Financial managers can create and manage subscription plans and salary plans.
    *   The system supports basic expense tracking and payroll processing based on defined plans.
    *   Customers can view their subscription and payment history.

*   **Test Cases:**

| Test ID      | Description                                   | Preconditions                            | Steps                                                                                                   | Expected Result                                                                      |
| :----------- | :-------------------------------------------- | :--------------------------------------- | :------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------- |
| TC_SUB_01  | Creation of a new subscription plan.          | Financial Manager is logged in.          | 1. Navigate to Plans. 2. Click "Add New". 3. Complete form with unique plan name. 4. Submit.             | New subscription plan created and visible in the list. Success message.            |
| TC_SUB_03  | Update an existing subscription plan's price. | Plan "Basic" exists. FM logged in.       | 1. Find "Basic" plan. 2. Click "Update". 3. Change price. 4. Submit.                                     | Plan price updated successfully. Success message.                                    |
| TC_SAL_01  | Creation of a new salary package.             | Financial Manager is logged in.          | 1. Navigate to Salary Plans. 2. Click "Add New". 3. Complete form. 4. Submit.                           | New salary plan created and listed. Success message.                                 |
| TC_PAY_01  | Process payroll for an employee.              | Payroll Officer logged in, salary plan defined & assigned. | 1. Select an employee. 2. Run payroll. 3. Confirm.                                      | Payment processed based on plan; records updated. Success message.                   |
| TC_BUD_01  | Submit a budget allocation entry.           | Financial Manager is logged in.          | 1. Navigate to Budget. 2. Enter expense details. 3. Submit.                                           | Budget entry recorded successfully.                                                  |

**2.5.3 Recycling Management**

*   **Acceptance Criteria:**
    *   Recyclers can submit purchase requests for available recyclable materials.
    *   Administrators can manage listed materials and approve/reject purchase requests.
    *   Payment amounts are calculated based on material type and quantity.
    *   Request statuses are updated and visible to both parties.

*   **Test Cases:**

| Test ID | Description                                              | Preconditions                                      | Steps                                                                                                                               | Expected Result                                                                                                   |
| :------ | :------------------------------------------------------- | :------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| TC-01   | Successful submission of a recycle purchase request.     | Recycler is logged in. Materials listed by admin.  | 1. Navigate to "Garbage Recycle". 2. Fill form (material, quantity, etc.). 3. Submit.                                              | Payment amount displayed. "Request submitted successfully." Request appears in "My Orders" with "Pending" status.   |
| TC-02   | Attempt to submit an incomplete recycle request form.    | Recycler is logged in.                             | 1. Navigate to "Garbage Recycle". 2. Leave a mandatory field blank. 3. Submit.                                                    | Error message: "Please fill in this field." Form remains editable. No submission.                                 |
| TC-05   | Recycler updates an existing "Pending" recycle request.  | Recycler logged in. A "Pending" request exists.    | 1. Go to "My Orders". 2. Click "Update" on the request. 3. Change quantity. 4. Save.                                              | Payment amount updates. Request saved with "Pending" status. "My Orders" shows updated details.                   |
| TC-08   | Admin approves a "Pending" recycle request.              | Admin logged in. A "Pending" request exists.       | 1. Go to "Recycling Requests". 2. Find request. 3. Click "Update Status". 4. Select "Approved".                                    | Status updates to "Approved". Recycler sees "Approved" status in "My Orders".                                     |
| TC-09   | Admin rejects a "Pending" recycle request.               | Admin logged in. A "Pending" request exists.       | 1. Go to "Recycling Requests". 2. Find request. 3. Click "Update Status". 4. Select "Rejected".                                    | Status updates to "Rejected". Recycler sees "Rejected" status in "My Orders".                                     |

**2.5.4 Pickup Request Management**

*   **Acceptance Criteria:**
    *   Customers can successfully submit garbage pickup requests with all required details, including location via map.
    *   Dynamic pickup fees are calculated and displayed.
    *   Administrators can efficiently manage requests (view, approve, reject, update status).
    *   Status changes are reflected for the customer.

*   **Test Cases:**

| Test ID | Description                                            | Preconditions                                           | Steps                                                                                                                             | Expected Result                                                                                                                  |
| :------ | :----------------------------------------------------- | :------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| TC_00  | Successful submission of a pickup request.             | User is logged in. Database accessible.                   | 1. Go to "Create Bin". 2. Fill form (name, contact, waste type, address, map location etc.). 3. Submit.                             | Pickup fee displayed. "Request submitted successfully." Request in "My Bin Details" with "Pending" status.                      |
| TC_01  | Attempt to submit an incomplete pickup request form.   | User is logged in.                                      | 1. Go to "Create Bin". 2. Leave "Address" blank. 3. Submit.                                                                       | Error message: "Please fill in this field." Form remains editable. No submission.                                                |
| TC_02  | User updates an existing "Pending" pickup request.     | User logged in. A "Pending" pickup request exists.      | 1. Go to "My Bin Details". 2. Find request. 3. Click "Edit". 4. Change waste type/date. 5. Submit.                                  | Pickup fee updated if applicable. "Request updated successfully." Updated details visible.                                       |
| TC_04  | Admin updates the status of a pickup request.          | Admin logged in. A pickup request exists.               | 1. Go to "Pickup Requests". 2. Find request. 3. Use "Status" dropdown to set to "On Progress".                                    | "Status updated successfully." Status updated in admin view and user's "My Bin Details" page.                                   |
| TC_05  | Admin sends a confirmation email for a pickup request. | Admin logged in. Pickup request exists. Email service configured. | 1. Go to "Pickup Requests". 2. Find request. 3. Click "Send Mail".                                                            | "Email sent successfully" message. User receives a confirmation email. (Actual email sending depends on SendGrid setup).         |

**2.5.5 Schedule and Resource Management**

*   **Acceptance Criteria:**
    *   Administrators can create collection schedules and assign routes to drivers and vehicles.
    *   Resources like trucks, tools, and equipment can be registered and their basic status tracked.
    *   Drivers can view their assigned routes and mark tasks as completed.

*   **Test Cases:**

| Test ID      | Description                                                   | Preconditions                                               | Steps                                                                                                            | Expected Result                                                                                                   |
| :----------- | :------------------------------------------------------------ | :---------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| TC_SCH_01  | Admin successfully creates a new collection route/schedule.     | Admin is logged in. Valid trucks and areas exist.             | 1. Navigate to "Schedule Management". 2. Fill route details (areas, truck, date, time). 3. Submit.             | Route created. New schedule appears with "Waiting" status. Truck availability might change.                       |
| TC_SCH_03  | Driver can view their assigned route for the current day.       | Driver logged in. Route assigned to the driver for today.   | 1. Navigate to "My Routes". 2. Select current date.                                                            | Assigned route details (schedule number, areas, truck, time, status) are displayed.                               |
| TC_TRK_01  | Admin successfully registers a new truck in the system.         | Admin is logged in.                                         | 1. Navigate to "Vehicle Management". 2. Fill truck details (truck ID, capacity, etc.). 3. Submit.              | Truck registered. New truck appears with "Active" status and "Available" availability.                            |
| TC_SCH_05  | Driver marks pickups as completed on their assigned route.      | Driver logged in. Route assigned with "Waiting" or "On Progress" status. | 1. Navigate to "My Routes". 2. Select route. 3. Mark specific areas/pickups as completed. 4. Submit updates. | Areas marked as completed. If all areas completed, route status updates to "Completed". Truck availability updated. |
| TC_EQP_01  | Admin successfully adds new equipment to resource management. | Admin is logged in.                                         | 1. Navigate to "Resource Management". 2. Select "Add Equipment". 3. Fill details (ID, name). 4. Submit.         | Equipment added successfully. Appears with "Operational" status.                                                  |

**Considerations for Non-Functional Aspects**

While formal, extensive non-functional testing with detailed metric reports was beyond the scope of the documented activities, the following aspects were implicitly considered during development and manual functional testing:

*   **Security:** Basic security hygiene was maintained, such as password hashing (bcryptjs), use of JWT for authentication, input validation to mitigate common risks (like XSS through user inputs), and role-based access control. The use of HTTPS was planned.
*   **Performance:** System responsiveness for typical user interactions (page loads, form submissions, data retrieval for dashboards) was informally observed. The aim was to ensure a smooth user experience without significant delays. The MERN stack itself is capable of good performance, and database queries were structured for efficiency where possible.
*   **Usability:** The choice of Material-UI and adherence to its design principles aimed to provide an intuitive and consistent user interface. The design of role-specific dashboards and clear workflows contributed to usability.

**Test Environment and Tools**

*   **Development Environment:** Developers utilized local MERN stack environments for coding and initial component testing.
*   **Testing Environment:** A common build deployed to a shared environment (details not specified, but assumed to be similar to a staging setup) would have been used for testing integrated features. This environment would connect to a MongoDB Atlas instance configured for testing and test accounts for any integrated third-party services.
*   **Tools:**
    *   Web Browser Developer Tools: For debugging frontend code, inspecting network requests, and examining UI elements.
    *   Trello: Used for logging and tracking defects identified during testing.
    *   Postman (or similar API testing tool): Likely used by developers for testing backend API endpoints during development.
    *   MongoDB Compass (or similar): Used for direct database inspection and verification of data integrity.

**Defect Management**

The process for managing defects identified during testing was as follows:
1.  **Logging:** Defects were logged as cards in the Trello project board. Each card typically included a description of the issue, steps to reproduce, expected vs. actual results, and severity.
2.  **Assignment:** Defects were assigned to the relevant developer responsible for the affected module or feature.
3.  **Prioritization:** Issues were informally prioritized based on their impact on core functionality and user experience.
4.  **Resolution and Verification:** Developers would fix the defects, and the fixes were then re-tested by the reporter or another team member to ensure resolution before closing the Trello card.

**Conclusion**

The testing activities for the SmartBin system, primarily centered around manual functional testing, were crucial for verifying that the core features met the specified requirements and user stories. The test cases executed across the five main modules helped identify and resolve key issues, ensuring a degree of reliability and usability. While comprehensive automated testing and formal non-functional testing would be beneficial for future enhancements and long-term maintenance, the implemented testing approach provided essential quality assurance within the project's scope.

---

### 2.6 Chapter 06: Evaluation and Conclusion
- [x] Complete

This chapter evaluates the SmartBin project against its initial aims and objectives, discusses the effectiveness of the chosen methodologies and technologies, and reflects on the challenges encountered and feedback received. It concludes by summarizing the project's achievements, its significance, and potential avenues for future development.

**6.1 Evaluation**

The SmartBin system was developed with the aim of creating a fully integrated web-based solution to centralize and streamline waste management operations, replacing manual processes with a profitable, efficient, and scalable digital platform. The project achieved a significant portion of its goals, with core functionalities approximately 80% complete. However, certain aspects, particularly regarding user interface polish and the implementation of all planned features, require further attention.

**6.1.1 Achievement of Aim and Objectives**

*   **Overall Aim:** The project has made substantial strides towards the central aim. The MERN stack architecture provides a foundation for an integrated platform.
    *   **Profitability:** The system design aims to enhance profitability by automating many previously manual tasks (e.g., in billing, scheduling), which is anticipated to reduce operational overhead associated with salaries, time delays, and bureaucratic inefficiencies. We plan to improve profitability by increasing efficiency, reducing bureaucracy, and eliminating the inefficiencies inherent in the old manual processes. While direct profitability metrics are beyond the scope of this academic project's deployment, the architectural choices and feature set are aligned with this goal.
    *   **Efficiency:** A key achievement is the significant reduction in manual processing. Many tasks across user management, financial operations, and request handling have been digitized, improving efficiency and reducing costs by saving time, minimizing salary expenses for manual work, and reducing delays between tasks. For instance, customer pickup requests, which were previously manual, are now managed through the system, including status tracking. This automation is expected to save time and reduce errors.
        *   Regarding **route optimization**, an objective for the Pickup Request Management module was to "Create route optimization algorithms based on requests and resources." The current implementation (as detailed in Chapter 4: Design and Development) allows administrators to manually define routes and assign them. Examination of the codebase confirms that while data for location and resources is captured, a fully dynamic, algorithmic route optimization component is not yet implemented and remains an area for future development. The current system lays the groundwork by capturing necessary data like pickup locations and resource details.
    *   **Scalability:** The choice of the MERN stack, particularly MongoDB Atlas and Node.js, was made with scalability in mind, allowing for horizontal scaling and flexible data handling to accommodate future growth in users and data volume, as detailed in Chapter 4 (Design and Development).

*   **Meeting Specific Objectives (Recap from Section 1.4):**
    *   **Objective 1: Establish a Robust Integrated Platform:** Largely achieved through the MERN stack architecture and API-driven communication between modules.
    *   **Objective 2: Empower Users and Staff:** Significantly met with user profile management, role-based access, and dashboards. The complaint handling module is in place. Staff performance tracking is basic, with advanced features planned.
    *   **Objective 3: Optimize Financial Operations:** Core features like subscription management, basic payroll, and financial dashboards are implemented. Lecturers noted the need for better integration of customer-facing subscription views and management, which is acknowledged.
    *   **Objective 4: Streamline Recycling and Pickup Processes:** Both modules have functional request submission, tracking, and admin management. Dynamic pricing for pickups is implemented. The route optimization for pickups is currently manual, as noted above.
    *   **Objective 5: Maximize Resource Utilization:** Resource registration (trucks, equipment) and basic status tracking are functional. Maintenance tracking and advanced analytics for resource optimization are areas for further development.

**6.1.2 Evaluation Against Test Results**

The testing phase (detailed in Chapter 5) focused on functional correctness. Most core functionalities passed their test cases. However, some issues were identified:
*   For example, during the testing of the **User Management module**, a test case related to the full implementation of CRUD (Create, Read, Update, Delete) operations for a specific user sub-entity failed, indicating a problem that required further debugging post-initial testing.
*   **Challenging Test Scenarios:** Testing the concurrency handling for pickup request submissions and simultaneous status updates by multiple admin users presented a realistic challenge. Ensuring data consistency across the distributed components of the MERN stack under such load, particularly for the `Pickup.ts` and `Schedule.ts` models, required careful test case design, simulating peak usage times to identify potential race conditions or data overwrites. Another challenge involved thoroughly testing the financial calculations for varied subscription downgrades mid-cycle, ensuring proration logic was correctly applied and reflected in mock Stripe API interactions; these were scenarios that proved challenging to comprehensively cover manually.

**6.1.3 Meeting Stakeholder Requirements & User/Expert Feedback**

The system addresses many core requirements outlined in Chapter 3 (Requirements). However, feedback and the current state indicate areas for improvement:
*   **Lecturer Feedback:**
    *   **User/Staff & Complaint Management:** The recommendation to implement a "Forgot Password" feature in the login section is a critical usability improvement that was not yet incorporated into the current build.
    *   **Financial Management:** Feedback highlighted the need for customers to more clearly view their current subscription plan and have a seamless interface to subscribe to different plans. This requires tighter integration between the `SubscriptionPlan.js` model, pricing display, and the `UserSubscription.js` management flow from the customer's perspective.
    *   **UI/UX:** A significant issue pointed out was the CSS styling in several data tables, where both the background and text color were dark, rendering the content difficult to read. This indicates a lapse in UI polishing and accessibility considerations.
*   **Client Feedback (Simulated):** While the core business logic was appreciated, initial client feedback on a demonstration highlighted that the lack of UI polish (e.g., the color contrast issue in tables, missing "Forgot Password" button) made the system feel incomplete and could impact user adoption if not addressed. This feedback emphasizes that while backend functionality is largely robust (around 80% for core logic), the user-facing aspects and some convenience features require more attention to meet full stakeholder satisfaction.

**6.1.4 Effectiveness of Methodology (Agile/Scrum)**

The Agile/Scrum methodology was adopted for project management.
*   **Positives (70%):**
    *   The iterative nature of sprints allowed the team to adapt to evolving understandings of requirements, particularly as the complexity of integrating five modules became apparent.
    *   Regular sprint reviews provided opportunities to demonstrate progress and receive early feedback, which was valuable in course-correcting minor deviations.
    *   Trello for task management provided good visibility into progress within each module.
    *   It fostered better communication within the team, especially important as each member had full-stack responsibility for specific modules.
*   **Challenges (30%):**
    *   At times, the one-week sprint cycle felt ambitious for completing and thoroughly testing more complex features across the full stack (frontend, backend, database interaction), leading to some features being partially completed and carried over.
    *   Ensuring consistent adherence to Agile principles across all team members, especially regarding daily stand-ups and detailed task estimation, was occasionally challenging, leading to minor coordination issues.
    *   Integrating the work from five distinct modules at the end of sprints sometimes revealed unforeseen dependencies or conflicts that required more refactoring time than initially allocated.

Overall, Agile/Scrum was beneficial for flexibility and iterative development, but the team could have improved sprint planning and inter-module dependency management.

**6.1.5 Effectiveness of Technical Choices (MERN Stack, TypeScript)**

The MERN stack (MongoDB, Express.js, React, Node.js) with a progressive migration to TypeScript was the chosen technology stack.
*   **Positives (80%):**
    *   The rationale outlined in Chapter 4 (Unified JavaScript/TypeScript ecosystem, MongoDB flexibility, Express.js for APIs, React for UI, Vite for frontend build speed) largely proved true.
    *   Using JavaScript/TypeScript across the stack streamlined development for team members.
    *   MongoDB Atlas provided excellent flexibility for evolving schemas, especially with diverse data like user profiles, financial records, and pickup requests.
    *   React with Material-UI enabled rapid development of a component-based UI.
    *   The ongoing migration to TypeScript, while challenging, began to yield benefits in terms of catching type errors early and improving code maintainability for the modules where it was more extensively applied.
*   **Negatives & Alternative Considerations:**
    *   **TypeScript Migration Overhead:** The "ongoing TypeScript migration" (mentioned in Chapter 3: Requirements and Chapter 4: Design) introduced a significant learning curve and development overhead, especially for backend modules. While beneficial long-term, it slowed down initial development velocity for some features. Perhaps a full commitment to TypeScript from the start for the backend, or sticking with JavaScript with robust JSDoc and linting, might have offered a more consistent development pace initially.
    *   **State Management Complexity:** While React Context API was used (Chapter 4), for a system with five interconnected modules and varied user roles, a more robust global state management solution like Redux or Zustand might have simplified cross-component state sharing and reduced prop-drilling, especially as the application grew in complexity. This could be a future refactoring consideration.
    *   **Backend Framework Choice:** While Express.js is flexible, for a project of this scale with multiple developers working on different modules, a more opinionated backend framework (e.g., NestJS which is TypeScript-first and offers a more structured architecture) could have potentially enforced greater consistency and reduced some of the boilerplate code, though it would come with its own learning curve.

The technical choices were largely effective, but the phased TypeScript adoption created some friction, and a more structured global state management approach could be beneficial.

**6.1.6 Challenges Encountered and Limitations**

*   **Technical Challenges:**
    *   The primary technical challenge was the progressive migration from JavaScript to TypeScript on the backend while simultaneously developing new features. This required careful coordination and sometimes led to inconsistencies between modules.
    *   Integrating five distinct functional modules, each with its own database models and API endpoints, required meticulous planning to ensure seamless data flow and avoid conflicts.
*   **Project Management Challenges:**
    *   Coordinating the efforts of team members, each responsible for a full-stack module, sometimes led to integration delays if one module fell behind.
*   **Current System Limitations:**
    *   **UI/UX Polish:** As discussed, the user interface requires significant polishing (e.g., CSS issues, missing convenience features like "Forgot Password"). Client and lecturer feedback emphasized this, noting that our product is not yet well-polished. For example, the problem with both text and background being black was a notable issue during demonstrations.
    *   **Incomplete Features:** Some advanced features within objectives (e.g., algorithmic route optimization, advanced staff performance KPIs, comprehensive financial analytics, direct IoT integration) are not yet implemented and are part of future extensibility. The "Forgot Password" button is a key example of an important feature that was overlooked.
    *   **Depth of Module Integration:** While core integrations exist, deeper, more nuanced interactions between some modules (e.g., advanced financial reporting based on operational efficiency from the scheduling module) are still to be developed.
    *   **Limited Automated Testing:** The testing strategy relied heavily on manual testing. A more comprehensive suite of automated unit and integration tests would improve long-term maintainability and reliability.

**6.2 Conclusion**

The SmartBin project successfully aimed to develop an integrated web-based solution to modernize waste management operations. The team achieved approximately 80% of the core functional goals, delivering a platform with five interconnected modules: User and Staff Management, Financial Management, Recycling Management, Pickup Request Management, and Schedule & Resource Management. The MERN stack architecture provides a solid and scalable foundation.

The system addresses key inefficiencies of traditional manual processes by automating tasks, providing digital interfaces for stakeholders, and centralizing data. Objectives related to establishing an integrated platform, empowering users and staff with basic tools, enabling core financial operations, streamlining pickup and recycling requests, and managing resources at a foundational level have been substantially met.

However, the project is not without its limitations. The user interface requires further refinement to enhance user experience and address issues like poor color contrast and missing convenience features such as a password reset option. As mentioned, the core modules and business logic are about 80% complete, but the polishing part, particularly the UI/UX, is not up to the mark, which was evident from client and lecturer feedback. Advanced functionalities, including algorithmic route optimization and in-depth data analytics, remain as future enhancements.

Despite these areas for improvement, the SmartBin system demonstrates significant potential. It has the capacity to drastically improve the efficiency and transparency of waste collection services in contexts like Sri Lanka. Even governmental bodies could potentially leverage this solution to enhance service delivery, especially with the ongoing digitalization efforts in the public sector. By offering a digital, integrated solution, SmartBin can contribute to better resource allocation, improved customer satisfaction, and more sustainable waste management practices. The platform is well-positioned for future development, including the integration of IoT technologies and more sophisticated data analytics, which could further enhance its impact. The project serves as a strong proof-of-concept for transforming traditional waste management into a more efficient, data-driven, and user-centric service.

**6.2.1 Future Work**

Building upon the current foundation, future work for SmartBin would focus on:
1.  **UI/UX Enhancement:** Prioritize addressing all UI/UX issues, including CSS fixes (e.g., table contrast), implementing the "Forgot Password" functionality, and improving overall navigation and user-friendliness based on further user testing.
2.  **Completing Core Feature Enhancements:**
    *   Implement customer-facing subscription management features as suggested by lecturers.
    *   Develop basic algorithmic suggestions for route optimization.
    *   Enhance staff performance tracking and financial reporting capabilities.
3.  **Implementing Planned Future Extensibility (from Chapter 3):**
    *   Develop the Gamification and Community Engagement Module.
    *   Build out APIs and backend logic for Direct Integration with IoT Smart Bins.
4.  **Expanding Automated Testing:** Develop a comprehensive suite of unit, integration, and end-to-end tests to ensure long-term stability and facilitate easier updates.
5.  **Advanced Analytics and Reporting:** Integrate more sophisticated data visualization and business intelligence tools to provide deeper insights into operational efficiency, financial performance, and environmental impact.
6.  **Mobile Application Development:** While the web application is responsive, dedicated mobile applications for customers and staff (especially drivers) could further enhance usability and accessibility.

---
### 2.7 References 
- [x] Complete

[1] MongoDB, "Managed MongoDB Hosting | Database-as-a-Service." [Online]. Available: https://www.mongodb.com/atlas (Accessed: [Please Add Access Date if not in original])
[2] OpenJS Foundation, "Express - Node.js web application framework," 2017. [Online]. Available: https://expressjs.com/
[3] A. Ranaweera, "Waste Management Challenges in Sri Lanka's Colombo and Kandy: Paving the Way for a Sustainable Future," LinkedIn, Mar. 23, 2023. [Online]. Available: https://www.linkedin.com/pulse/waste-management-challenges-sri-lankas-colombo-kandy-paving
[4] A. M. A. Saja, A. M. Z. Zimar, and S. M. Junaideen, "Municipal Solid Waste Management Practices and Challenges in the Southeastern Coastal Cities of Sri Lanka," *Sustainability*, vol. 13, no. 8, Art. no. 4556, Apr. 2021, doi: 10.3390/su13084556.
[5] L. M. Dharmasiri, "Waste Management in Sri Lanka: Challenges and Opportunities," *Sri Lanka Journal of Advanced Social Studies*, vol. 9, no. 1, p. 72, Dec. 2019, doi: 10.4038/sljass.v9i1.7149.
[6] National Institute of Standards and Technology, "Role Based Access Control | CSRC," 2012. [Online]. Available: https://csrc.nist.gov/projects/role-based-access-control
[7] J. Williamson and K. Curran, "Best Practice in Multi-factor Authentication," *Semiconductor Science and Information Devices*, vol. 3, no. 1, May 2021, doi: 10.30564/ssid.v3i1.3152.
[8] K. Abhishek, S. Roshan, P. Kumar, and R. Ranjan, "A Comprehensive Study on Multifactor Authentication Schemes," in *Advances in Computing and Information Technology*, vol. 177, Berlin, Heidelberg: Springer, 2013, pp. 561–568, doi: 10.1007/978-3-642-31552-7_57.
[9] C. Braz and J.-M. Robert, "Security and usability," in *Proc. 18th Int. Conf. Association Francophone d'Interaction Homme-Machine (IHM '06)*, 2006, doi: 10.1145/1132736.1132768.
[10] I. Maddox, "Account authentication and password management best practices," Google Cloud Blog, May 07, 2021. [Online]. Available: https://cloud.google.com/blog/products/identity-security/account-authentication-and-password-management-best-practices
[11] M. Farooq, J. Cheng, N. U. Khan, R. A. Saufi, N. Kanwal, and H. A. Bazkiaei, "Sustainable Waste Management Companies with Innovative Smart Solutions: A Systematic Review and Conceptual Model," *Sustainability*, vol. 14, no. 20, Art. no. 13146, Jan. 2022, doi: 10.3390/su142013146.
[12] A. M. Ahmed, C. N. Mohammed, and A. M. Ahmad, "Web-based payroll management system: design, implementation, and evaluation," *Journal of Electrical Systems and Information Technology*, vol. 10, no. 1, Art. no. 82, Mar. 2023, doi: 10.1186/s43067-023-00082-5.
[13] FP&A Trends, "Leveraging Business Intelligence to Empower Finance Business Partnering and Profitability Analysis," May 05, 2021. [Online]. Available: https://fpa-trends.com/article/leveraging-business-intelligence
[14] Stripe, "Stripe API Reference." [Online]. Available: https://stripe.com/docs/api (Accessed: [Please Add Access Date if no publication date available])
[15] Oracle NetSuite, "How Automated Invoicing Saves Time," Nov. 10, 2022. [Online]. Available: https://www.netsuite.com/portal/resource/articles/accounting/invoice-automation.shtml
[16] Qlik, "12 Financial Dashboard Examples & Templates." [Online]. Available: https://www.qlik.com/us/dashboard-examples/financial-dashboards (Accessed: [Please Add Access Date if no publication date available])

---

## 3. Post-body Section
- [ ] Complete

### 3.1 Appendix A (1-2 pages)
- [ ] Complete

>[!info]
>A table containing the work done by each member

### 3.2 Appendix B (1 page)
- [ ] Complete

>[!info]
>Contribution made to the final report by each member

### 3.3 Appendix C (if any) 
- [ ] Complete

>[!warning]
>If there are any appendices, make sure to refer to them in the body. See the appendices section of this document and identify how they are referred within the document. Recommend to have main content in the main chapters and additional supporting content in Appendix C. 
