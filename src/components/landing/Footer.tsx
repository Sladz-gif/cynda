const footerLinks = {
  Product: ["Features", "Pricing", "Security", "Integrations"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Resources: ["Documentation", "API", "Status", "Changelog"],
  Legal: ["Privacy", "Terms", "Security Policy"],
};

const Footer = () => {
  return (
    <footer className="border-t border-border py-16 bg-card">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xs">C</span>
              </div>
              <span className="font-display text-lg font-bold text-foreground">Cynda</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Work OS that replaces everything.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display text-sm font-semibold mb-4 text-foreground">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 Cynda. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
