/* ======================= GEORGIA DOE ELA STANDARDS DATA ======================= */
/* Sourced from Georgia's K-12 English Language Arts (ELA) Standards: Foundations,
   Language, Texts & Practices (GA DOE, approved May 2023) — domain / big idea /
   standard structure, condensed for this builder. Guided picker currently covers
   English Language Arts/Literacy; other subjects use manual entry. */
export const ELA_STANDARDS = {
  "Foundations": {
    code:"F",
    note:"K–5 only — builds early literacy skills to aid reading comprehension.",
    bigIdeas:{
      "Phonics":{code:"P", standards:[
        {code:"F.P.4", title:"Decoding & Encoding with Phonics", subskills:[
          "Decode and encode words with graphemes that represent multiple letter-sound correspondences",
          "Decode and encode single-syllable and multisyllabic words of all syllable types",
          "Decode and encode words with common prefixes and suffixes"
        ]}
      ]},
      "Fluency":{code:"F", standards:[
        {code:"F.F.1", title:"Oral & Silent Reading Fluency", subskills:[
          "Read grade-level texts with increasing accuracy and automaticity",
          "Read grade-level texts aloud with appropriate prosody",
          "Self-correct while reading to aid comprehension and fluency"
        ]}
      ]},
      "Handwriting":{code:"H", standards:[
        {code:"F.H.3", title:"Read Cursive", subskills:[
          "Read phrases and sentences written in cursive",
          "Read a variety of texts written in cursive"
        ]},
        {code:"F.H.4", title:"Write Cursive", subskills:[
          "Form cursive letters and connectors between letters",
          "Produce texts using cursive writing legibly and efficiently"
        ]}
      ]}
    }
  },
  "Language": {
    code:"L",
    note:"Structures and conventions of standard English; grammar and vocabulary.",
    bigIdeas:{
      "Grammar Conventions":{code:"GC", standards:[
        {code:"L.GC.1", title:"Grammar, Usage, & Mechanics", subskills:[
          "Apply conventions of Standard English grammar, usage, and mechanics",
          "Communicate clearly and precisely in written and spoken language",
          "Use conventional capitalization, punctuation, and citations when incorporating evidence"
        ]},
        {code:"L.GC.2", title:"Syntax", subskills:[
          "Distinguish correctly structured simple, compound, and complex sentences",
          "Use a variety of sentence types to strengthen clarity and coherence",
          "Maintain consistent verb tense within and across a text"
        ]}
      ]},
      "Vocabulary":{code:"V", standards:[
        {code:"L.V.1", title:"General, Academic, & Specialized Vocabulary", subskills:[
          "Acquire general, academic, and specialized vocabulary through grade-level texts",
          "Use grade-level vocabulary with precision to enhance communication"
        ]},
        {code:"L.V.2", title:"Word Analysis", subskills:[
          "Deconstruct words using roots, root words, and affixes to determine meaning",
          "Construct words using knowledge of roots and affixes"
        ]},
        {code:"L.V.3", title:"Meaning & Purpose", subskills:[
          "Use context to determine or clarify the meaning of unknown and multiple-meaning words",
          "Use print and digital reference materials to clarify word meaning",
          "Distinguish shades of meaning among closely related words"
        ]}
      ]}
    }
  },
  "Texts": {
    code:"T",
    note:"K–12 — purposeful engagement with texts across genres and modes.",
    bigIdeas:{
      "Context":{code:"C", standards:[
        {code:"T.C.1", title:"Purpose & Audience", subskills:[
          "Determine the purpose and target audience of a text",
          "Describe how an author's choice of mode influences audience and purpose"
        ]},
        {code:"T.C.2", title:"Authors & Speakers", subskills:[
          "Describe how a narrator or speaker's perspective influences the text",
          "Make inferences about the context in which a text was written"
        ]}
      ]},
      "Structure & Style":{code:"SS", standards:[
        {code:"T.SS.1", title:"Organization", subskills:[
          "Describe how text features and organizational structure represent ideas coherently",
          "Craft related sentences or ideas into cohesive paragraphs using transitions"
        ]},
        {code:"T.SS.2", title:"Craft", subskills:[
          "Identify and explain the use of figurative language",
          "Use figurative language for intentional effect when writing"
        ]}
      ]},
      "Techniques":{code:"T", standards:[
        {code:"T.T.1", title:"Narrative Techniques", subskills:[
          "Analyze how narrative techniques convey character, setting, and plot",
          "Apply narrative techniques to develop a real or imagined experience"
        ]},
        {code:"T.T.2", title:"Expository Techniques", subskills:[
          "Evaluate techniques used to present and design expository texts",
          "Apply expository techniques to introduce and develop a topic with facts and details"
        ]},
        {code:"T.T.3", title:"Opinion Techniques", subskills:[
          "Evaluate techniques used to present opinion and argumentative texts",
          "Apply opinion techniques, supplying reasons and evidence with linking words"
        ]},
        {code:"T.T.4", title:"Poetic Techniques", subskills:[
          "Discuss techniques used to present and design poetry",
          "Apply poetic techniques to produce poetry for an intended effect"
        ]}
      ]},
      "Research & Analysis":{code:"RA", standards:[
        {code:"T.RA.1", title:"Research & Inquiry", subskills:[
          "Generate and refine questions about a self-selected topic",
          "Conduct research using multiple credible sources"
        ]},
        {code:"T.RA.2", title:"Curating Sources & Evidence", subskills:[
          "Refer to specific passages or quotations to support an idea",
          "Determine the credibility and relevance of a source text"
        ]}
      ]}
    }
  },
  "Practices": {
    code:"P",
    note:"K–12 — literacy practices that ground Foundations, Language, and Texts.",
    bigIdeas:{
      "Engagement & Intention for Comprehension & Composition":{code:"EICC", standards:[
        {code:"P.EICC.1", title:"Reader & Writer Identity", subskills:[
          "Build an identity as a reader and writer",
          "Develop independence and autonomy as a reader and writer"
        ]},
        {code:"P.EICC.3", title:"Comprehension Strategies", subskills:[
          "Set a purpose for reading and monitor comprehension",
          "Make, track, and support inferences within a text"
        ]},
        {code:"P.EICC.4", title:"Writing Processes", subskills:[
          "Plan, draft, evaluate, revise, and edit texts",
          "Evaluate a text's effectiveness against its purpose and audience"
        ]}
      ]},
      "Situating Texts":{code:"ST", standards:[
        {code:"P.ST.1", title:"Context", subskills:[
          "Identify key components of context relevant to a text",
          "Explore how context shapes an author's decisions"
        ]},
        {code:"P.ST.2", title:"Author, Audience, & Purpose", subskills:[
          "Establish the purpose of a text being read or written",
          "Establish a clear point of view when constructing texts"
        ]}
      ]},
      "Author's Craft":{code:"AC", standards:[
        {code:"P.AC.1", title:"Reading like a Writer", subskills:[
          "Identify and evaluate an author's craft techniques",
          "Explain how word choice and sentence structure affect the audience"
        ]},
        {code:"P.AC.2", title:"Writing like a Reader", subskills:[
          "Make craft decisions with the audience's experience in mind",
          "Craft words and phrases to influence the reader"
        ]}
      ]},
      "Collaboration & Presentation":{code:"CP", standards:[
        {code:"P.CP.1", title:"Collaboration", subskills:[
          "Collaborate with others to accomplish shared goals",
          "Offer and respond to feedback in group work"
        ]},
        {code:"P.CP.2", title:"Presentation", subskills:[
          "Communicate clearly to present ideas and information",
          "Vary tone and pace for purpose and audience"
        ]}
      ]}
    }
  }
};
