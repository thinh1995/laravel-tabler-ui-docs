function Accordion(id, items ) {
  const listItems = items.map((item, index) =>
    <div class="accordion-item" key={'accordion-item' + index}>
      <button class="accordion-header" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${index}-default`} aria-expanded="true">
        <div class="accordion-header-text">
          <h4>{item['title']}</h4>
        </div>
        <div class="accordion-header-toggle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="icon icon-1"
          >
            <path d="M6 9l6 6l6 -6" />
          </svg>
        </div>
      </button>
      <div id={`collapse-${index}-default`} class="accordion-collapse collapse show" data-bs-parent={`#${id}`}>
        <div class="accordion-body">
          {item['body']}
        </div>
      </div>
    </div>
  );
  return (
    <div class='accordion' id={id}>{listItems}</div>
  );
}

export default function AccordionPage() {
  const items = [
    {
      'title': 'What makes Tabler different from other UI frameworks?',
      'body': 'Tabler offers a modern, responsive design with a clean aesthetic, built on Bootstrap for ease of use and flexibility.'
    },
    {
      'title': 'How can I customize Tabler components to fit my design needs?',
      'body': 'You can customize Tabler components using CSS variables, SCSS, and utility classes to match your design preferences.'
    }
  ];

  return (
    <section>
      <div className="container">
        <div className="row">
          {Accordion('accordion', items)}
        </div>
      </div>
    </section>
  );
}