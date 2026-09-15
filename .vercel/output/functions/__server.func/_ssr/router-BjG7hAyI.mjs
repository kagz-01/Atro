import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { B as notFound, _ as createFileRoute, b as useRouter, d as HeadContent, f as useRouterState, g as lazyRouteComponent, h as Outlet, m as createRouter, u as Scripts, v as createRootRoute, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as QueryClientProvider, r as require_jsx_runtime, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-DgjzUpi5.mjs";
import { a as object, i as number, n as array, o as string, r as literal, s as union, t as _enum } from "../_libs/zod.mjs";
import { a as MessageCircle, i as MessageSquareText, n as TriangleAlert, o as Menu, r as Send, t as X } from "../_libs/lucide-react.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/site-CaZ2AfOM.js
var COMPANY = {
	name: "ATRO Design & Construction",
	short: "ATRO",
	tagline: "Designing & Building Better Structures",
	lede: "Integrated design, construction and consultancy for residential, commercial and institutional projects.",
	support: "From concept to construction, ATRO brings design thinking, technical expertise and practical project delivery together.",
	email: "hello@atro.ke",
	phoneDisplay: "+254 700 123 456",
	phoneTel: "+254700123456",
	whatsapp: "254700123456",
	hours: "Mon–Sat, 08:00–18:00 EAT",
	address: "Nairobi, Kenya",
	instagram: "https://instagram.com",
	linkedin: "https://www.linkedin.com"
};
var ZONES = [
	{
		slug: "nairobi",
		name: "Nairobi",
		region: "Nairobi County",
		status: "active",
		cx: 51,
		cy: 61,
		summary: "Full design-and-build coverage across Nairobi — from Karen and Lavington compounds to compact infill in the inner suburbs.",
		coverage: "Active delivery",
		typical: "Houses, extensions, commercial fit-out, mixed-use",
		logistics: "Shortest lead times. Site visits usually within a few days.",
		seoTitle: "Building Contractors in Nairobi | ATRO Design & Construction",
		seoDescription: "Design and construction company in Nairobi. Integrated architectural design, cost planning and project execution for homes, commercial and institutional work.",
		faqs: [{
			q: "Do you handle Nairobi County approvals?",
			a: "We coordinate the drawings, quantities and submissions a project needs, and work with the licensed professionals required for statutory sign-off. We do not present ourselves as a substitute for regulated registrations."
		}, {
			q: "Can you work on a tight urban plot?",
			a: "Yes. A large share of Nairobi work is infill: constrained access, neighbour conditions, and sequencing that has to respect a live street. We plan that at cost-planning stage, not after demolition."
		}]
	},
	{
		slug: "kiambu",
		name: "Kiambu",
		region: "Kiambu County",
		status: "active",
		cx: 50,
		cy: 55,
		summary: "One of our densest delivery areas — ridge houses, family homes and institutional work across Kiambu, Ruiru, Kikuyu and Thika Road.",
		coverage: "Active delivery",
		typical: "Family houses, schools, churches, farm compounds",
		logistics: "Routine coverage. Soils and access vary plot to plot — we assess before we price.",
		seoTitle: "Construction Company in Kiambu | ATRO Design & Construction",
		seoDescription: "House construction and design-build services in Kiambu County. BOQ-led costing, site consultancy and integrated delivery.",
		faqs: [{
			q: "How is Kiambu different from Nairobi on cost?",
			a: "Labour and some materials can be slightly softer, but access, black cotton soil and water can erase that on the wrong plot. We never quote a Nairobi rate onto a Kiambu site without walking it."
		}, {
			q: "Do you take on owner-managed sites?",
			a: "We can. The cleaner path is that we hold design, quantities and construction together so decisions do not fragment between three parties."
		}]
	},
	{
		slug: "machakos",
		name: "Machakos",
		region: "Machakos County",
		status: "active",
		cx: 57,
		cy: 66,
		summary: "Athiriver, Mavoko, Machakos town and surrounding plots — residential and light commercial, with a clear view of quarry, transport and water realities.",
		coverage: "Active delivery",
		typical: "Homes, warehouses, light commercial",
		logistics: "Regular coverage. Material haulage and water planning sit in the first assessment.",
		seoTitle: "Building Contractors in Machakos | ATRO Design & Construction",
		seoDescription: "Design and construction in Machakos County — residential, warehouse and light commercial work with cost-aware delivery.",
		faqs: [{
			q: "Can you start from a bare plot with no drawings?",
			a: "Yes. Consultation, site assessment and concept design are the first three steps. Construction does not start on a sketch."
		}]
	},
	{
		slug: "kajiado",
		name: "Kajiado",
		region: "Kajiado County",
		status: "active",
		cx: 48,
		cy: 72,
		summary: "Kitengela, Ongata Rongai, Ngong and Isinya. Climate, wind and long services runs matter more here than a Nairobi template.",
		coverage: "Active delivery",
		typical: "Homes, institutions, farm buildings",
		logistics: "Active. We plan for water, power and access before we lock a programme.",
		seoTitle: "Construction Company in Kajiado | ATRO Design & Construction",
		seoDescription: "Design-build and project management for homes and institutions in Kajiado — Kitengela, Ngong, Rongai and around.",
		faqs: [{
			q: "Do you work beyond Kitengela?",
			a: "Yes, across Kajiado where access is practical. Remote sites are flagged in the enquiry so we can be honest about logistics before anyone spends a week writing a brief."
		}]
	},
	{
		slug: "coast",
		name: "Coast",
		region: "Mombasa & coastal counties",
		status: "limited",
		cx: 68,
		cy: 84,
		summary: "Coral stone, humidity, salt air and a different labour market. We take coastal work with a dedicated logistics plan — not a Nairobi drawing reprinted.",
		coverage: "Limited · planned delivery",
		typical: "Houses, hospitality, institutional",
		logistics: "By programme. Salt, moisture and supply lines are priced, not wished away.",
		seoTitle: "Building Contractors at the Kenyan Coast | ATRO",
		seoDescription: "Coastal design and construction in Mombasa and around — houses and hospitality work planned for humidity, salt and local materials.",
		faqs: [{
			q: "Will a Nairobi specification survive at the coast?",
			a: "Often not. Steel protection, roof build-up, openings and finishes have to be rewritten for salt and moisture. That is part of the assessment, not a variation later."
		}]
	},
	{
		slug: "nakuru",
		name: "Nakuru",
		region: "Nakuru County",
		status: "limited",
		cx: 40,
		cy: 56,
		summary: "Nakuru town, Naivasha and surrounding farmland. We take defined scopes with a site presence plan rather than a fly-in promise.",
		coverage: "Limited · by programme",
		typical: "Homes, churches, schools",
		logistics: "Scheduled visits. A resident site lead is agreed before construction.",
		seoTitle: "Construction Company in Nakuru | ATRO Design & Construction",
		seoDescription: "Design, cost planning and construction for homes, churches and schools in Nakuru County.",
		faqs: [{
			q: "Can you run a Nakuru site from Nairobi?",
			a: "Not as a substitute for presence. Remote reporting is a layer on top of a site lead, not instead of one."
		}]
	},
	{
		slug: "kisumu",
		name: "Kisumu",
		region: "Kisumu & Nyanza",
		status: "request",
		cx: 27,
		cy: 62,
		summary: "We review Kisumu and wider Nyanza work case by case. If the scope, access and programme fit, we say so early.",
		coverage: "By request",
		typical: "Defined residential and institutional scopes",
		logistics: "Enquiry first. We will not take a site we cannot properly attend.",
		seoTitle: "Construction Consultancy in Kisumu | ATRO",
		seoDescription: "Project consultancy and selected design-build work in Kisumu, reviewed case by case.",
		faqs: [{
			q: "Is ATRO based in Kisumu?",
			a: "No. Nairobi is the studio base. Kisumu work proceeds only when we can resource it honestly."
		}]
	},
	{
		slug: "diaspora",
		name: "Diaspora-managed",
		region: "Projects in Kenya, clients abroad",
		status: "diaspora",
		cx: 78,
		cy: 28,
		summary: "For Kenyans building at home from the UK, Gulf, US and the region. The product is the same — the communication is built for time zones, video and WhatsApp.",
		coverage: "Active · remote-first clients",
		typical: "Family houses, rental units, plot-to-handover",
		logistics: "EAT working hours with scheduled calls. Photo timelines, written decisions, and a named site contact.",
		seoTitle: "Diaspora House Construction in Kenya | ATRO",
		seoDescription: "Build in Kenya from abroad. ATRO manages design, cost planning and construction with WhatsApp, video and a living project timeline.",
		faqs: [{
			q: "Can I avoid flying in until handover?",
			a: "Many clients do. We still recommend at least one site visit at structure, because photographs cannot replace walking a building. The rest can be remote."
		}, {
			q: "How do you stop a site drifting while I am away?",
			a: "Quantities, a locked scope, a photo timeline, and a single decision log. Drift usually starts when three people think they are in charge of the same wall."
		}]
	}
];
var PROJECTS = [
	{
		slug: "karen-courtyard-house",
		name: "Karen Courtyard House",
		location: "Karen, Nairobi",
		zone: "nairobi",
		type: "Residential",
		status: "Completed",
		year: "2025",
		area: "420 m²",
		duration: "14 months",
		scope: "Design, cost planning, construction",
		excerpt: "A courtyard house organised around light, a mature garden and a quiet street edge.",
		challenge: "The existing trees and a long, narrow plot made a conventional front-and-back house clumsy. The client wanted privacy from the road without turning the garden into leftover space.",
		role: "Full design-and-build. ATRO held concept, quantities and construction as one sequence.",
		solution: "A single-storey courtyard plan with a stone and plaster outer wall, timber screens to the west, and rooms that look inward to a planted court. Structure and finishes were locked against a BOQ before breaking ground.",
		image: "/images/karen.webp",
		gallery: [
			{
				src: "/images/karen.webp",
				alt: "Garden elevation of the Karen courtyard house"
			},
			{
				src: "/images/interior.webp",
				alt: "Living room opening to the garden"
			},
			{
				src: "/images/detail.webp",
				alt: "Stone and concrete junction"
			},
			{
				src: "/images/hero.webp",
				alt: "Evening view of the courtyard"
			}
		],
		featured: true
	},
	{
		slug: "kiambu-ridge-residence",
		name: "Kiambu Ridge Residence",
		location: "Kiambu",
		zone: "kiambu",
		type: "Residential",
		status: "Completed",
		year: "2025",
		area: "280 m²",
		duration: "11 months",
		scope: "Architecture, BOQ, construction",
		excerpt: "A two-storey family house on a sloping Kiambu plot, built to a locked budget.",
		challenge: "A cross-fall site and a hard cost ceiling. The first sketch the family loved would have blown the budget on retaining and a long driveway.",
		role: "Design, quantities and construction. Cost planning ran in parallel with concept, not after it.",
		solution: "The house steps with the land. Brick and render, a dark metal roof, and a short access that does not fight the contour. The BOQ was the document the family used to choose finishes — not a surprise at the end.",
		image: "/images/kiambu.webp",
		gallery: [
			{
				src: "/images/kiambu.webp",
				alt: "Street elevation of the Kiambu residence"
			},
			{
				src: "/images/interior.webp",
				alt: "Interior with garden light"
			},
			{
				src: "/images/detail.webp",
				alt: "Masonry detail"
			}
		],
		featured: true
	},
	{
		slug: "nyali-veranda-house",
		name: "Nyali Veranda House",
		location: "Nyali, Mombasa",
		zone: "coast",
		type: "Residential",
		status: "Completed",
		year: "2024",
		area: "310 m²",
		duration: "13 months",
		scope: "Design revision, coastal specification, construction",
		excerpt: "A coral-stone house rewritten for salt air, deep shade and monsoon rain.",
		challenge: "An inland specification had already been drawn. Left unchanged it would have failed in three years: unprotected steel, tight eaves, and finishes that do not like salt.",
		role: "We rebuilt the specification, quantities and construction plan for the coast.",
		solution: "Coral stone, deep verandas, a roof that actually throws water, and a protection schedule for every piece of metal. The house is slower in the heat and quieter in the rain.",
		image: "/images/coast.webp",
		gallery: [
			{
				src: "/images/coast.webp",
				alt: "Deep veranda of the Nyali house"
			},
			{
				src: "/images/interior.webp",
				alt: "Shaded interior"
			},
			{
				src: "/images/detail.webp",
				alt: "Stonework in raking light"
			}
		],
		featured: true
	},
	{
		slug: "westlands-atelier",
		name: "Westlands Atelier",
		location: "Westlands, Nairobi",
		zone: "nairobi",
		type: "Commercial",
		status: "Completed",
		year: "2025",
		area: "640 m²",
		duration: "9 months",
		scope: "Design, construction, interiors",
		excerpt: "A small commercial building with a terracotta screen — shade, grain and a calm street face.",
		challenge: "A noisy road and a west-facing elevation. Glass-forward would have cooked the rooms and advertised every interior to the street.",
		role: "Architecture, interiors and construction of a two-level workplace.",
		solution: "A clay screen that shades and grain-filters the west light, deep-set openings, and a simple plan that can be let as one or two tenancies without rebuilding walls.",
		image: "/images/commercial.webp",
		gallery: [
			{
				src: "/images/commercial.webp",
				alt: "Terracotta screen facade in Westlands"
			},
			{
				src: "/images/detail.webp",
				alt: "Facade detail"
			},
			{
				src: "/images/interior.webp",
				alt: "Workplace interior"
			}
		],
		featured: true
	},
	{
		slug: "nakuru-parish-hall",
		name: "Nakuru Parish Hall",
		location: "Nakuru",
		zone: "nakuru",
		type: "Church",
		status: "Completed",
		year: "2024",
		area: "480 m²",
		duration: "10 months",
		scope: "Concept, cost planning, construction",
		excerpt: "A parish hall with a high timber nave, built to be used all week, not only on Sunday.",
		challenge: "The congregation needed a hall that could take worship, a school feeding programme and evening meetings — on a budget that could not absorb a cathedral.",
		role: "We designed a robust, well-lit hall and built it against a public BOQ the building committee could follow.",
		solution: "A simple masonry volume, a timber-lined roof, clerestory light, and a floor that survives chairs, feet and cleaning. No decorative structure. The money went into the roof, the light and the floor.",
		image: "/images/church.webp",
		gallery: [
			{
				src: "/images/church.webp",
				alt: "Nave and courtyard of the parish hall"
			},
			{
				src: "/images/detail.webp",
				alt: "Masonry and timber junction"
			},
			{
				src: "/images/school.webp",
				alt: "Covered edge of the compound"
			}
		],
		featured: false
	},
	{
		slug: "jacaranda-primary-wing",
		name: "Jacaranda Primary Wing",
		location: "Kiambu",
		zone: "kiambu",
		type: "School",
		status: "Completed",
		year: "2025",
		area: "720 m²",
		duration: "8 months",
		scope: "Design, construction",
		excerpt: "A new classroom wing and covered walkway, planned around a jacaranda court.",
		challenge: "The school could not close. Construction had to happen around a live timetable, with dust, noise and child movement designed, not improvised.",
		role: "Phased construction with a locked programme the headteacher could publish to parents.",
		solution: "A linear classroom block, a covered walk, and a court that was kept open throughout. Phases were sized so a class never lost two rooms at once.",
		image: "/images/school.webp",
		gallery: [
			{
				src: "/images/school.webp",
				alt: "Classroom wing and jacaranda court"
			},
			{
				src: "/images/detail.webp",
				alt: "Painted masonry in sunlight"
			},
			{
				src: "/images/site.webp",
				alt: "Earlier construction stage"
			}
		],
		featured: false
	},
	{
		slug: "lavington-frame",
		name: "Lavington Frame",
		location: "Lavington, Nairobi",
		zone: "nairobi",
		type: "Residential",
		status: "Ongoing",
		year: "2026",
		area: "360 m²",
		duration: "In progress",
		scope: "Design, BOQ, construction",
		excerpt: "A two-level house in frame. Structure is up; finishes are being locked against the remaining BOQ.",
		challenge: "The family is split between Nairobi and London. Decisions have to travel. The site cannot wait for a monthly call.",
		role: "Design-and-build with a living photo timeline and a written decision log.",
		solution: "Frame first, finishes second, each choice priced before it is made. The family sees the site weekly. Ongoing work is labelled as ongoing — it is not a completed house.",
		image: "/images/site.webp",
		gallery: [
			{
				src: "/images/site.webp",
				alt: "Reinforced concrete frame on the Lavington site"
			},
			{
				src: "/images/detail.webp",
				alt: "Concrete and formwork"
			},
			{
				src: "/images/hero.webp",
				alt: "Reference for the intended courtyard"
			}
		],
		featured: true,
		timeline: [
			{
				date: "Jan 2026",
				title: "Foundations",
				caption: "Ground beams and pads, inspected before backfill.",
				image: "/images/site.webp"
			},
			{
				date: "Mar 2026",
				title: "Ground floor slab",
				caption: "Services cast in. Setting-out checked against the locked drawings.",
				image: "/images/detail.webp"
			},
			{
				date: "Jun 2026",
				title: "First-floor frame",
				caption: "Columns and beams in. The house is now a structure, not a drawing.",
				image: "/images/site.webp"
			}
		]
	},
	{
		slug: "ruiru-garden-house",
		name: "Ruiru Garden House",
		location: "Ruiru, Kiambu",
		zone: "kiambu",
		type: "Residential",
		status: "Proposed",
		year: "2026",
		area: "240 m²",
		duration: "Proposed",
		scope: "Concept & cost planning",
		excerpt: "A compact garden house for a diaspora client. Concept and cost range agreed; construction not yet started.",
		challenge: "A 50 × 100 plot and a budget that has to include a boundary, a septic and a small rental wing — or not. The first job is to decide that, on paper.",
		role: "Concept, site assessment and a BOQ-led cost range. No construction until the family chooses a scope they can fund.",
		solution: "Two options: a single house with a generous garden, or a house plus a one-bedroom rental. Each has a range, not a hopeful number.",
		image: "/images/hero.webp",
		gallery: [
			{
				src: "/images/hero.webp",
				alt: "Reference courtyard for the Ruiru proposal"
			},
			{
				src: "/images/interior.webp",
				alt: "Interior direction"
			},
			{
				src: "/images/kiambu.webp",
				alt: "Comparable Kiambu house"
			}
		],
		featured: false
	}
];
var SERVICES = [
	{
		slug: "architectural-design",
		title: "Architectural Design",
		kicker: "From brief to a building that can actually be built",
		lede: "Plans, sections, elevations and a material direction that survive contact with a site, a BOQ and a contractor — because in our case the contractor is us.",
		image: "/images/hero.webp",
		included: [
			"Briefing and site reading",
			"Concept options with a cost-aware filter",
			"Developed drawings for pricing and construction",
			"Material and opening schedules",
			"Coordination with structural and services input"
		],
		types: [
			"Houses",
			"Extensions",
			"Commercial shells",
			"Institutional buildings"
		],
		inputs: [
			"Site location and size",
			"What you need the building to do",
			"A budget band, even if it is rough",
			"Any existing drawings or survey"
		]
	},
	{
		slug: "structural-design",
		title: "Structural Design",
		kicker: "The frame that makes the drawing stand up",
		lede: "We coordinate structural design as part of an integrated project — so the architecture, the quantities and the frame are one conversation, not three files that disagree.",
		image: "/images/site.webp",
		included: [
			"Structural concept with the architectural plan",
			"Coordination of calculations and drawings with licensed structural professionals",
			"Foundation and frame intent aligned to soil and programme",
			"Buildability review before steel is ordered"
		],
		types: [
			"Residential frames",
			"Institutional halls",
			"Low-rise commercial"
		],
		inputs: [
			"Architectural drawings",
			"Soil information where available",
			"Intended loads and use"
		],
		note: "Statutory structural sign-off is carried by the licensed professional appointed on the project. ATRO coordinates; we do not imply a registration we have not stated."
	},
	{
		slug: "construction",
		title: "Construction & Project Execution",
		kicker: "The building, on the ground, against a locked scope",
		lede: "Site set-up, structure, envelope and finishes — run from a programme, a BOQ and a weekly communication rhythm. Not from a WhatsApp argument.",
		image: "/images/site.webp",
		included: [
			"Site establishment and safety set-up",
			"Structure, masonry, roof and envelope",
			"Finishes against an agreed schedule",
			"Quality checks at hold-points",
			"Handover with a snag list that is actually closed"
		],
		types: [
			"New houses",
			"Extensions",
			"Institutional",
			"Commercial"
		],
		inputs: [
			"Approved drawings",
			"A priced BOQ or equivalent scope",
			"Access to the plot",
			"Decision-maker on call"
		]
	},
	{
		slug: "boq-cost-planning",
		title: "Bill of Quantities / Cost Planning",
		kicker: "A number you can make a decision with",
		lede: "Quantities, rates and options — so you choose a roof, a floor and a window because you understand what they cost, not because a contractor smiled.",
		image: "/images/detail.webp",
		included: [
			"Measured quantities from drawings",
			"Cost ranges and option studies",
			"Scope alignment before procurement",
			"Change control during construction"
		],
		types: [
			"New build",
			"Renovation",
			"Phased work",
			"Diaspora-managed projects"
		],
		inputs: [
			"Drawings or a clear brief",
			"Finish intent",
			"What must be in the first phase"
		]
	},
	{
		slug: "project-management",
		title: "Project Management & Site Consultancy",
		kicker: "Someone on the site who can read a drawing",
		lede: "For clients who already have a contractor, or who are building from abroad: a site-based eye, a written log, and decisions that do not evaporate.",
		image: "/images/site.webp",
		included: [
			"Site inspections against drawings",
			"Progress photography and a decision log",
			"Programme and cost checkpoints",
			"Snagging and handover support"
		],
		types: [
			"Owner-builder sites",
			"Diaspora projects",
			"Institutional clients"
		],
		inputs: [
			"Drawings",
			"Contract or contractor details",
			"What you want us to hold you to"
		]
	},
	{
		slug: "interior-spatial",
		title: "Interior / Spatial Design",
		kicker: "The rooms, not only the envelope",
		lede: "Joinery, light, floors and the way a house is actually used — designed with the structure, not stuck on at the end as a moodboard.",
		image: "/images/interior.webp",
		included: [
			"Furniture and joinery intent",
			"Finish palettes tied to the BOQ",
			"Lighting and opening studies",
			"Site review of sample boards"
		],
		types: [
			"Houses",
			"Workplaces",
			"Hospitality rooms"
		],
		inputs: [
			"How you live or work",
			"Pieces you already own",
			"A finish budget"
		]
	},
	{
		slug: "precast",
		title: "Precast & Construction Solutions",
		kicker: "Where a faster, cleaner method actually helps",
		lede: "Precast, modular and other modern methods — used when they save time or waste, not as a slogan. If in-situ is the honest answer, we say so.",
		image: "/images/detail.webp",
		included: [
			"Method review at concept",
			"Where precast earns its transport cost",
			"Coordination with structure and finishes",
			"On-site sequencing"
		],
		types: [
			"Repeat units",
			"Schools",
			"Boundary and drainage elements"
		],
		inputs: [
			"Programme pressure",
			"Access for lifting",
			"Repeatability of the design"
		]
	}
];
var PROCESS_STEPS = [
	{
		n: "01",
		title: "Initial Consultation",
		body: "We listen to what you want the building to do, where it sits, and what you can spend. This is a conversation, not a pitch deck."
	},
	{
		n: "02",
		title: "Site & Project Assessment",
		body: "Access, soil, neighbours, services, county process. The constraints that will decide the building if we ignore them."
	},
	{
		n: "03",
		title: "Concept & Design",
		body: "A direction that can be built. Options, not a single precious sketch. Cost sits in the room while we draw."
	},
	{
		n: "04",
		title: "Cost Planning",
		body: "Quantities, a range, then a scope you can fund. If the sketch and the money disagree, the money wins until the sketch is rewritten."
	},
	{
		n: "05",
		title: "Approvals & Pre-Construction",
		body: "Documentation, the professionals the law requires, procurement. We do not start a site on a promise."
	},
	{
		n: "06",
		title: "Construction",
		body: "The building. Hold-points, a programme, and a site that looks like someone is in charge."
	},
	{
		n: "07",
		title: "Monitoring & Communication",
		body: "You know what happened this week, what is next, and what needs a decision. Especially if you are not in the country."
	},
	{
		n: "08",
		title: "Handover",
		body: "Inspected, snagged, closed. Keys, documents, and a building you can occupy without a hidden list."
	}
];
var ARTICLES = [
	{
		slug: "what-a-boq-protects-you-from",
		title: "What a BOQ actually protects you from",
		kicker: "Cost",
		date: "August 2026",
		read: "6 min",
		excerpt: "A bill of quantities is not bureaucracy. It is the difference between choosing a floor and discovering you cannot afford a roof.",
		image: "/images/detail.webp",
		body: [
			{ p: "Most construction arguments in Kenya are not about taste. They are about a number that was never measured. A contractor names a figure for “a four-bedroom house.” A family agrees. Then the windows change, the soil is black cotton, the septic was never in the price, and everyone is suddenly a negotiator." },
			{
				h: "A BOQ is a list of decisions",
				p: "A bill of quantities takes a drawing and turns it into countable work: cubic metres of concrete, square metres of roof, running metres of skirting. Once it exists, a change has a cost. Before it exists, a change is a feeling."
			},
			{ p: "That is why ATRO runs cost planning in parallel with design. A courtyard that looks calm on tracing paper can be an expensive retaining wall on a Kiambu slope. Better to know that in week three than in month nine." },
			{
				h: "What it will not do",
				p: "A BOQ is not a guarantee against inflation, theft, or a client who changes the stairs twice. It is a shared document. Used honestly, it lets a family in London and a site in Lavington talk about the same wall."
			}
		]
	},
	{
		slug: "building-from-the-diaspora",
		title: "Building from the diaspora: the five things that fail first",
		kicker: "Diaspora",
		date: "July 2026",
		read: "7 min",
		excerpt: "The plot is in Kiambu. You are in Doha. Here is what actually breaks — and what to put in writing before anyone digs.",
		image: "/images/kiambu.webp",
		body: [
			{ p: "Kenyans abroad build some of the most ambitious houses in the country, and some of the most stranded. The pattern is familiar: a relative on the ground, a contractor with a van, photographs that always look like progress, and a budget that quietly doubled." },
			{
				h: "1. Nobody owns the drawing",
				p: "If the person pouring concrete cannot point to a dimension, they are inventing the house. Send drawings. Pay for them. Do not start with “you know how Kenyan houses look.”"
			},
			{
				h: "2. The relative is not a project manager",
				p: "A cousin can collect keys. A cousin cannot usually read a reinforcement schedule. Asking them to do both is how families fall out. Put a named professional on the site, and let family be family."
			},
			{
				h: "3. Photographs lie about level, square and damp",
				p: "A weekly photo timeline is useful. It is not an inspection. Budget for at least one visit at structure, or for someone whose job is to walk the building with a spirit level and a drawing."
			},
			{
				h: "4. Scope drift loves WhatsApp",
				p: "Voice notes are not variations. If a window moves, it goes into a written log with a cost. Otherwise you will fund a different house from the one you approved."
			},
			{
				h: "5. Handover is a date, not a mood",
				p: "Agree what “done” means: snags closed, services live, documents in your hands. A house that is “almost” finished can stay that way for a year."
			}
		]
	},
	{
		slug: "nairobi-vs-kiambu",
		title: "Nairobi vs Kiambu: what actually changes on the ground",
		kicker: "Zones",
		date: "June 2026",
		read: "5 min",
		excerpt: "Twenty kilometres can change soil, water, labour and the county desk you will sit at. Here is the honest version.",
		image: "/images/school.webp",
		body: [
			{ p: "Clients often ask for a Nairobi rate on a Kiambu plot, or the reverse. The buildings can look similar. The ground does not." },
			{
				h: "Soil and water",
				p: "Kiambu’s black cotton, murram and slope will decide your foundation faster than your Pinterest board. Nairobi infill more often fights access, neighbours and a tight plot. Both can be built well. Neither is a copy of the other."
			},
			{
				h: "Labour and haulage",
				p: "Some trades are cheaper outside the city until you factor in transport, water bowers and the day nobody came because it rained on the road. A cost plan that ignores logistics is a wish."
			},
			{
				h: "The county process",
				p: "Approvals, inspections and the way a file moves are not identical. We plan the process as part of pre-construction, and we do not pretend a stamp is a formality."
			},
			{ p: "If you tell us the plot, we will tell you which of these will matter. That is the point of zone intelligence — not a coloured map for its own sake." }
		]
	}
];
var TRUST_POINTS = [
	{
		title: "Design + Construction",
		body: "One team, one sequence. The drawing is not thrown over a wall."
	},
	{
		title: "Technical consultancy",
		body: "Decisions from drawings, quantities, specifications and the site."
	},
	{
		title: "Quality & cost control",
		body: "A locked scope. Changes are priced before they are built."
	},
	{
		title: "Visible project management",
		body: "You know the status without chasing a voice note."
	},
	{
		title: "Kenya-based delivery",
		body: "Nairobi studio. Real coverage, honestly described."
	}
];
var WHY = [
	{
		title: "Integrated thinking",
		body: "Design and construction are considered together, so a beautiful wall is also a buildable one."
	},
	{
		title: "Technical approach",
		body: "Drawings, quantities, specifications and site realities — not mood and hope."
	},
	{
		title: "Cost awareness",
		body: "You see the range before you fall in love with a stair that the budget cannot carry."
	},
	{
		title: "Quality in the execution",
		body: "Hold-points, materials that are what they say they are, and finishes that match the sample."
	},
	{
		title: "Clear communication",
		body: "Especially if you are not on the site. Written decisions. Photographs with dates."
	},
	{
		title: "Modern methods, used honestly",
		body: "Precast, digital tools, a photo timeline — when they help. Never as decoration."
	}
];
var VALUES = [
	{
		title: "Clarity",
		body: "We would rather lose a job than win it with a number that cannot survive the soil."
	},
	{
		title: "Craft",
		body: "Joints, levels, waterproofing. The unphotogenic work that decides whether a house lasts."
	},
	{
		title: "Stewardship",
		body: "Someone else’s money, land and years. We treat them as if they were ours."
	},
	{
		title: "Presence",
		body: "A site that is attended. A client who is informed. A drawing that matches the wall."
	}
];
var NAV = [
	{
		to: "/projects",
		label: "Work"
	},
	{
		to: "/services",
		label: "Services"
	},
	{
		to: "/zones",
		label: "Zones"
	},
	{
		to: "/process",
		label: "Process"
	},
	{
		to: "/insights",
		label: "Insights"
	},
	{
		to: "/about",
		label: "About"
	}
];
function zoneBySlug(slug) {
	return ZONES.find((z) => z.slug === slug);
}
function projectBySlug(slug) {
	return PROJECTS.find((p) => p.slug === slug);
}
function serviceBySlug(slug) {
	return SERVICES.find((s) => s.slug === slug);
}
function articleBySlug(slug) {
	return ARTICLES.find((a) => a.slug === slug);
}
function projectsInZone(slug) {
	return PROJECTS.filter((p) => p.zone === slug);
}
function featuredProjects() {
	return PROJECTS.filter((p) => p.featured);
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-BjG7hAyI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-burgundy",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl text-maroon",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-muted",
				children: errorMessage(error)
			})
		]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-sans font-medium tracking-wide uppercase transition-[background-color,color,border-color,transform,opacity] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold", {
	variants: {
		variant: {
			primary: "bg-burgundy text-paper hover:bg-maroon border border-burgundy",
			gold: "bg-gold text-maroon hover:bg-gold-light border border-gold",
			outline: "bg-transparent text-burgundy border border-burgundy hover:bg-burgundy hover:text-paper",
			inverse: "bg-paper text-maroon border border-paper hover:bg-gold-light",
			ghost: "bg-transparent text-ink border border-transparent hover:border-line hover:bg-stone/40",
			line: "bg-transparent text-paper border border-paper/40 hover:border-gold hover:text-gold"
		},
		size: {
			sm: "h-10 px-4 text-[11px] rounded-xs",
			md: "h-12 px-5 text-[12px] rounded-xs",
			lg: "h-14 px-7 text-[12px] rounded-xs"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function NotFound() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "min-h-[70vh] flex flex-col items-center justify-center px-6 text-center pt-28",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "404"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 font-display text-5xl text-maroon",
				children: "This page is not on the drawings."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-md text-ink/70",
				children: "The URL does not match a project, service or zone. Start from the studio home, or tell us what you were looking for."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						children: "Home"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/start",
						children: "Start a project"
					})
				})]
			})
		]
	});
}
/**
* App-wide client provider mounted once near the top of `<body>` in `__root.tsx`.
* Query + toasts live here so route files stay free of provider boilerplate.
*/
function AuthProvider({ children }) {
	const [client] = (0, import_react.useState)(() => new QueryClient({ defaultOptions: { queries: {
		staleTime: 6e4,
		refetchOnWindowFocus: false
	} } }));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
			position: "top-center",
			toastOptions: { className: "font-sans" }
		})]
	});
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var Input = object({ messages: array(object({
	role: _enum(["user", "assistant"]),
	content: string().max(2e3)
})).max(12) });
var askConcierge = createServerFn({ method: "POST" }).validator(Input).handler(createSsrRpc("104ab998a74b2c68797d912e64133b8591b961b4d1026dcb4caaa6e711018f75"));
function whatsappHref(text) {
	return `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(text)}`;
}
function defaultWhatsappText(opts) {
	const bits = ["Hello ATRO — I would like to start a project."];
	if (opts?.type) bits.push(`Type: ${opts.type}.`);
	if (opts?.zone) bits.push(`Location: ${opts.zone}.`);
	return bits.join(" ");
}
var STARTERS = [
	"Do you build in Kiambu?",
	"How does the cost range work?",
	"I am building from abroad — how do you run the site?"
];
function Concierge() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [input, setInput] = (0, import_react.useState)("");
	const [messages, setMessages] = (0, import_react.useState)([{
		role: "assistant",
		content: "I can point you to a service, a zone, or the next step. I will not quote a price or sign anything off — that is a person."
	}]);
	const listRef = (0, import_react.useRef)(null);
	const mutation = useMutation({
		mutationFn: async (next) => {
			return askConcierge({ data: { messages: next.filter((m, i) => !(i === 0 && m.role === "assistant")).slice(-10) } });
		},
		onSuccess: (res) => {
			if (res.ok) setMessages((m) => [...m, {
				role: "assistant",
				content: res.text
			}]);
			else setMessages((m) => [...m, {
				role: "assistant",
				content: res.error
			}]);
			queueMicrotask(() => {
				listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
			});
		}
	});
	function send(text) {
		const trimmed = text.trim();
		if (!trimmed || mutation.isPending || messages.length > 16) return;
		const next = [...messages, {
			role: "user",
			content: trimmed
		}];
		setMessages(next);
		setInput("");
		mutation.mutate(next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => setOpen(true),
		className: "fixed z-30 left-4 bottom-4 md:left-6 md:bottom-6 h-12 px-4 rounded-xs bg-maroon text-paper text-[11px] uppercase tracking-[0.16em] inline-flex items-center gap-2 shadow-soft hover:bg-burgundy",
		"aria-haspopup": "dialog",
		"aria-expanded": open,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquareText, { className: "size-4" }), "Ask ATRO"]
	}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6",
		role: "dialog",
		"aria-label": "ATRO concierge",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-ink/50",
			"aria-label": "Close concierge",
			onClick: () => setOpen(false)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full sm:max-w-md bg-paper text-ink rounded-t-md sm:rounded-md shadow-soft flex flex-col max-h-[85vh]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-5 h-14 border-b border-line",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-[0.16em] text-gold",
						children: "Concierge"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl text-maroon leading-none",
						children: "Ask ATRO"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setOpen(false),
						className: "size-11 inline-flex items-center justify-center",
						"aria-label": "Close",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: listRef,
					className: "flex-1 overflow-y-auto px-5 py-4 space-y-3",
					children: [messages.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("max-w-[90%] text-sm leading-relaxed px-3 py-2 rounded-sm", m.role === "assistant" ? "bg-stone text-ink" : "bg-burgundy text-paper ml-auto"),
						children: m.content
					}, `${m.role}-${i}`)), mutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted uppercase tracking-[0.16em]",
						children: "Thinking"
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-5 pb-3 flex flex-wrap gap-2",
					children: STARTERS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-[11px] border border-line px-2.5 py-1.5 rounded-xs hover:border-burgundy",
						onClick: () => send(s),
						children: s
					}, s))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "px-5 pb-5 flex gap-2",
					onSubmit: (e) => {
						e.preventDefault();
						send(input);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: input,
						onChange: (e) => setInput(e.target.value),
						placeholder: "Ask about a zone, a service, the process",
						className: "flex-1 h-12 border border-line bg-cream px-3 rounded-sm outline-none focus:border-burgundy",
						maxLength: 500
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "size-12 bg-burgundy text-paper inline-flex items-center justify-center rounded-xs disabled:opacity-40",
						disabled: mutation.isPending,
						"aria-label": "Send",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 pb-5 flex gap-4 text-[11px] uppercase tracking-[0.14em] text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/start",
						className: "hover:text-burgundy",
						onClick: () => setOpen(false),
						children: "Start a project"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: whatsappHref(defaultWhatsappText()),
						target: "_blank",
						rel: "noreferrer",
						className: "hover:text-burgundy",
						children: "WhatsApp"
					})]
				})
			]
		})]
	}) : null] });
}
function LogoMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 40 40",
		className: cn("block", className),
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "40",
				height: "40",
				className: "fill-maroon"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M20 8 L32 22 H8 Z",
				className: "fill-gold"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "14",
				y: "25.2",
				width: "12",
				height: "3",
				className: "fill-gold-light"
			})
		]
	});
}
function Logo({ inverted, compact }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/",
		className: "flex items-center gap-3 min-h-11 group",
		"aria-label": "ATRO home",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, { className: "size-10 shrink-0" }), !compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex flex-col leading-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("font-display text-[1.35rem] tracking-[0.18em] font-medium", inverted ? "text-paper" : "text-maroon"),
				children: "ATRO"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("text-[9px] uppercase tracking-[0.22em] mt-1", inverted ? "text-gold-light" : "text-muted"),
				children: "Design & Construction"
			})]
		}) : null]
	});
}
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "bg-maroon text-paper",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-20",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-12 md:grid-cols-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "md:col-span-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { inverted: true }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-6 text-sm text-paper/70 max-w-sm",
								children: COMPANY.support
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-6 text-[11px] uppercase tracking-[0.18em] text-gold",
								children: [
									COMPANY.address,
									" · ",
									COMPANY.hours
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "md:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] uppercase tracking-[0.18em] text-gold mb-4",
							children: "Studio"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "space-y-2 text-sm text-paper/80",
							children: [NAV.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: n.to,
								className: "hover:text-gold",
								children: n.label
							}) }, n.to)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/start",
								className: "hover:text-gold",
								children: "Start a project"
							}) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "md:col-span-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] uppercase tracking-[0.18em] text-gold mb-4",
							children: "Services"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2 text-sm text-paper/80",
							children: SERVICES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/services/$slug",
								params: { slug: s.slug },
								className: "hover:text-gold",
								children: s.title
							}) }, s.slug))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "md:col-span-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] uppercase tracking-[0.18em] text-gold mb-4",
							children: "Where we build"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2 text-sm text-paper/80",
							children: ZONES.map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/zones/$slug",
								params: { slug: z.slug },
								className: "hover:text-gold",
								children: z.name
							}) }, z.slug))
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-16 pt-6 border-t border-paper/10 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between text-[12px] text-paper/50",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"© ",
					(/* @__PURE__ */ new Date()).getFullYear(),
					" ",
					COMPANY.name
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/privacy",
							className: "hover:text-gold",
							children: "Privacy"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/terms",
							className: "hover:text-gold",
							children: "Terms"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: `mailto:${COMPANY.email}`,
							className: "hover:text-gold",
							children: COMPANY.email
						})
					]
				})]
			})]
		})
	});
}
var useSiteStore = create()(persist((set) => ({
	diasporaMode: false,
	setDiasporaMode: (v) => set({ diasporaMode: v }),
	selectedZone: null,
	setSelectedZone: (z) => set({ selectedZone: z })
}), {
	name: "atro.site",
	skipHydration: true
}));
function SiteHeader() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [open, setOpen] = (0, import_react.useState)(false);
	const [scrolled, setScrolled] = (0, import_react.useState)(false);
	const diaspora = useSiteStore((s) => s.diasporaMode);
	const setDiaspora = useSiteStore((s) => s.setDiasporaMode);
	(0, import_react.useEffect)(() => {
		const onScroll = () => setScrolled(window.scrollY > 12);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
	(0, import_react.useEffect)(() => {
		setOpen(false);
	}, [pathname]);
	(0, import_react.useEffect)(() => {
		document.body.style.overflow = open ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);
	const onDarkHero = pathname === "/" && !scrolled && !open;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: cn("fixed top-0 inset-x-0 z-40 transition-[background-color,border-color,box-shadow] duration-300", onDarkHero ? "bg-maroon/35 border-b border-transparent backdrop-blur-[2px]" : "bg-paper/95 border-b border-line shadow-soft backdrop-blur-md"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 h-16 md:h-[4.5rem] flex items-center gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { inverted: onDarkHero }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "hidden lg:flex items-center gap-1 ml-8",
					"aria-label": "Primary",
					children: NAV.map((item) => {
						const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: item.to,
							className: cn("px-3 h-11 inline-flex items-center text-[12px] uppercase tracking-[0.16em] transition-colors", onDarkHero ? active ? "text-gold" : "text-paper/80 hover:text-paper" : active ? "text-burgundy" : "text-ink/70 hover:text-maroon"),
							children: item.label
						}, item.to);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setDiaspora(!diaspora),
							className: cn("hidden md:inline-flex h-11 px-3 items-center text-[10px] uppercase tracking-[0.16em] border rounded-xs transition-colors", diaspora ? "bg-gold text-maroon border-gold" : onDarkHero ? "text-paper/80 border-paper/30 hover:border-gold hover:text-gold" : "text-muted border-line hover:border-burgundy hover:text-burgundy"),
							"aria-pressed": diaspora,
							children: diaspora ? "Diaspora on" : "Building from abroad?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							variant: onDarkHero ? "gold" : "primary",
							className: "hidden sm:inline-flex",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/start",
								children: "Start a project"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: cn("lg:hidden size-11 inline-flex items-center justify-center", onDarkHero ? "text-paper" : "text-maroon"),
							"aria-label": open ? "Close menu" : "Open menu",
							"aria-expanded": open,
							onClick: () => setOpen((v) => !v),
							children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-6" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-6" })
						})
					]
				})
			]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "lg:hidden fixed inset-0 top-16 bg-maroon text-paper overflow-y-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "px-6 py-8 flex flex-col",
				"aria-label": "Mobile",
				children: [
					NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: item.to,
						className: "font-display text-4xl py-3 border-b border-paper/10 tracking-tight",
						children: item.label
					}, item.to)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/start",
						className: "font-display text-4xl py-3 text-gold",
						children: "Start a project"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setDiaspora(!diaspora),
						className: "mt-8 self-start text-[11px] uppercase tracking-[0.16em] border border-paper/30 px-4 h-11",
						children: diaspora ? "Diaspora mode on" : "Building from abroad?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-10 text-sm text-paper/60",
						children: COMPANY.phoneDisplay
					})
				]
			})
		}) : null]
	});
}
function WhatsappFab() {
	const href = whatsappHref(defaultWhatsappText({ zone: useSiteStore((s) => s.selectedZone) }));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		href,
		target: "_blank",
		rel: "noreferrer",
		className: "fixed z-30 right-4 bottom-4 md:right-6 md:bottom-6 size-14 rounded-xs bg-whatsapp text-cream shadow-soft inline-flex items-center justify-center hover:brightness-95 active:scale-[0.96] transition-transform",
		"aria-label": "Chat on WhatsApp",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {
			className: "size-7",
			strokeWidth: 1.75
		})
	});
}
function SiteShell({ children }) {
	(0, import_react.useEffect)(() => {
		useSiteStore.persist.rehydrate();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh flex flex-col bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "#main",
				className: "skip-link",
				children: "Skip to content"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				id: "main",
				className: "flex-1",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsappFab, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Concierge, {})
		]
	});
}
var styles_default = "/assets/styles-CPcFOXwJ.css";
var APP_NAME = "ATRO Design & Construction";
var Route$14 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "ATRO Design & Construction — integrated design, construction and consultancy in Kenya. Designing and building better structures."
			},
			{
				name: "theme-color",
				content: "#3C0508"
			},
			{
				name: "keywords",
				content: "construction company in Kenya, design and construction company Kenya, building contractors Nairobi, building contractors Kiambu, architectural design Kenya"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Outfit:wght@300;400;500;600;700&display=swap"
			}
		]
	}),
	component: RootDocument
});
function RootDocument() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "bg-paper text-ink",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	});
}
var $$splitComponentImporter$13 = () => import("./routes-Dl3Ljlkp.mjs");
var Route$13 = createFileRoute("/")({
	component: lazyRouteComponent($$splitComponentImporter$13, "component"),
	head: () => ({ meta: [{ title: "ATRO Design & Construction — Designing & Building Better Structures" }, {
		name: "description",
		content: COMPANY.lede
	}] })
});
var $$splitComponentImporter$12 = () => import("./about-W0goJR3Q.mjs");
var Route$12 = createFileRoute("/about")({
	component: lazyRouteComponent($$splitComponentImporter$12, "component"),
	head: () => ({ meta: [{ title: "About ATRO — Design & Construction" }, {
		name: "description",
		content: "ATRO is a modern Kenyan design-and-construction company focused on well-designed, technically sound, efficiently delivered structures."
	}] })
});
var $$splitComponentImporter$11 = () => import("./privacy-Bu6pFEw-.mjs");
var Route$11 = createFileRoute("/privacy")({
	component: lazyRouteComponent($$splitComponentImporter$11, "component"),
	head: () => ({ meta: [{ title: "Privacy — ATRO" }] })
});
var $$splitComponentImporter$10 = () => import("./process-BbV5ufLM.mjs");
var Route$10 = createFileRoute("/process")({
	component: lazyRouteComponent($$splitComponentImporter$10, "component"),
	head: () => ({ meta: [{ title: "Our process — ATRO Design & Construction" }, {
		name: "description",
		content: "Eight steps from consultation to handover: assessment, design, cost planning, approvals, construction and communication."
	}] })
});
var $$splitComponentImporter$9 = () => import("./start-DyQDA0P1.mjs");
var Route$9 = createFileRoute("/start")({
	component: lazyRouteComponent($$splitComponentImporter$9, "component"),
	head: () => ({ meta: [{ title: "Start a project — ATRO Design & Construction" }, {
		name: "description",
		content: "Guided enquiry for ATRO: project type, zone, scale and an indicative cost range — then a person."
	}] })
});
var $$splitComponentImporter$8 = () => import("./terms-_IQDragX.mjs");
var Route$8 = createFileRoute("/terms")({
	component: lazyRouteComponent($$splitComponentImporter$8, "component"),
	head: () => ({ meta: [{ title: "Terms — ATRO" }] })
});
var $$splitComponentImporter$7 = () => import("./insights-DXzN-4lM.mjs");
var Route$7 = createFileRoute("/insights/")({
	component: lazyRouteComponent($$splitComponentImporter$7, "component"),
	head: () => ({ meta: [{ title: "Insights — ATRO Design & Construction" }, {
		name: "description",
		content: "Notes on BOQ-led costing, diaspora building, and what actually changes between Nairobi and Kiambu."
	}] })
});
var $$splitComponentImporter$6 = () => import("../_slug-CWKfdRfx.mjs");
var Route$6 = createFileRoute("/insights/$slug")({
	component: lazyRouteComponent($$splitComponentImporter$6, "component"),
	loader: ({ params }) => {
		const article = articleBySlug(params.slug);
		if (!article) throw notFound();
		return { article };
	},
	head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.article.title ?? "Insight"} — ATRO` }, {
		name: "description",
		content: loaderData?.article.excerpt ?? ""
	}] })
});
var $$splitComponentImporter$5 = () => import("./projects-CUuRGztR.mjs");
var Route$5 = createFileRoute("/projects/")({
	component: lazyRouteComponent($$splitComponentImporter$5, "component"),
	head: () => ({ meta: [{ title: "Work — ATRO Design & Construction" }, {
		name: "description",
		content: "Completed, ongoing and proposed projects by ATRO across Nairobi, Kiambu, the Coast and beyond."
	}] })
});
var $$splitComponentImporter$4 = () => import("../_slug-CsAsT83Y.mjs");
var Route$4 = createFileRoute("/projects/$slug")({
	component: lazyRouteComponent($$splitComponentImporter$4, "component"),
	loader: ({ params }) => {
		const project = projectBySlug(params.slug);
		if (!project) throw notFound();
		return { project };
	},
	head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.project.name ?? "Project"} — ATRO` }, {
		name: "description",
		content: loaderData?.project.excerpt ?? ""
	}] })
});
var $$splitComponentImporter$3 = () => import("./services-BWnCU_RF.mjs");
var Route$3 = createFileRoute("/services/")({
	component: lazyRouteComponent($$splitComponentImporter$3, "component"),
	head: () => ({ meta: [{ title: "Services — ATRO Design & Construction" }, {
		name: "description",
		content: "Architectural design, construction, BOQ and cost planning, project management and interiors — delivered as one sequence."
	}] })
});
var $$splitComponentImporter$2 = () => import("../_slug-D7EgXvEV.mjs");
var Route$2 = createFileRoute("/services/$slug")({
	component: lazyRouteComponent($$splitComponentImporter$2, "component"),
	loader: ({ params }) => {
		const service = serviceBySlug(params.slug);
		if (!service) throw notFound();
		return { service };
	},
	head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.service.title ?? "Service"} — ATRO` }, {
		name: "description",
		content: loaderData?.service.lede ?? ""
	}] })
});
var $$splitComponentImporter$1 = () => import("./zones-BZa6UaeI.mjs");
var Route$1 = createFileRoute("/zones/")({
	component: lazyRouteComponent($$splitComponentImporter$1, "component"),
	head: () => ({ meta: [{ title: "Where we build — Zone Intelligence | ATRO" }, {
		name: "description",
		content: "ATRO coverage across Nairobi, Kiambu, Machakos, Kajiado, the Coast, Nakuru and diaspora-managed Kenyan projects."
	}] })
});
var $$splitComponentImporter = () => import("../_slug-XrWzUPwE.mjs");
var Route = createFileRoute("/zones/$slug")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	loader: ({ params }) => {
		const zone = zoneBySlug(params.slug);
		if (!zone) throw notFound();
		return {
			zone,
			projects: projectsInZone(zone.slug)
		};
	},
	head: ({ loaderData }) => ({ meta: [{ title: loaderData?.zone.seoTitle ?? "Zone — ATRO" }, {
		name: "description",
		content: loaderData?.zone.seoDescription ?? ""
	}] })
});
var IndexRoute = Route$13.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$14
});
var AboutRoute = Route$12.update({
	id: "/about",
	path: "/about",
	getParentRoute: () => Route$14
});
var PrivacyRoute = Route$11.update({
	id: "/privacy",
	path: "/privacy",
	getParentRoute: () => Route$14
});
var ProcessRoute = Route$10.update({
	id: "/process",
	path: "/process",
	getParentRoute: () => Route$14
});
var StartRoute = Route$9.update({
	id: "/start",
	path: "/start",
	getParentRoute: () => Route$14
});
var TermsRoute = Route$8.update({
	id: "/terms",
	path: "/terms",
	getParentRoute: () => Route$14
});
var InsightsIndexRoute = Route$7.update({
	id: "/insights/",
	path: "/insights/",
	getParentRoute: () => Route$14
});
var InsightsSlugRoute = Route$6.update({
	id: "/insights/$slug",
	path: "/insights/$slug",
	getParentRoute: () => Route$14
});
var ProjectsIndexRoute = Route$5.update({
	id: "/projects/",
	path: "/projects/",
	getParentRoute: () => Route$14
});
var ProjectsSlugRoute = Route$4.update({
	id: "/projects/$slug",
	path: "/projects/$slug",
	getParentRoute: () => Route$14
});
var ServicesIndexRoute = Route$3.update({
	id: "/services/",
	path: "/services/",
	getParentRoute: () => Route$14
});
var ServicesSlugRoute = Route$2.update({
	id: "/services/$slug",
	path: "/services/$slug",
	getParentRoute: () => Route$14
});
var ZonesIndexRoute = Route$1.update({
	id: "/zones/",
	path: "/zones/",
	getParentRoute: () => Route$14
});
var rootRouteChildren = {
	IndexRoute,
	AboutRoute,
	PrivacyRoute,
	ProcessRoute,
	StartRoute,
	TermsRoute,
	InsightsSlugRoute,
	ProjectsSlugRoute,
	ServicesSlugRoute,
	ZonesSlugRoute: Route.update({
		id: "/zones/$slug",
		path: "/zones/$slug",
		getParentRoute: () => Route$14
	}),
	InsightsIndexRoute,
	ProjectsIndexRoute,
	ServicesIndexRoute,
	ZonesIndexRoute
};
var routeTree = Route$14._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent,
		defaultNotFoundComponent: NotFound,
		defaultPreload: "intent",
		scrollRestoration: true
	});
}
//#endregion
export { WHY as _, Route$6 as a, whatsappHref as c, COMPANY as d, PROCESS_STEPS as f, VALUES as g, TRUST_POINTS as h, Route$4 as i, Button as l, SERVICES as m, Route as n, useSiteStore as o, PROJECTS as p, Route$2 as r, defaultWhatsappText as s, router_exports as t, ARTICLES as u, ZONES as v, featuredProjects as y };
