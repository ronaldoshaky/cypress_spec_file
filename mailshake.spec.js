
context('MailShake demo test', () => {

  	// Improvement: Move selectors to a central location / or into a page object setup	
  	let prospectsLink = "div.mat-list-item-content span.mat-badge"
  	let loginPath = 'https://app.mailshake.com/login'
	let userNameField = "input#mat-input-0"
	let passwordField = "input#mat-input-1"
	let loginButton = "button.mat-raised-button"
	let userName = "leslieknope@mailinator.com"
	let password = "'F'-\\\(3S@e9^(w=/"
	let largeTimeout = 60000
	let selectAllProspectsCheckbox = "mat-header-row.mat-header-row mat-checkbox"
	let unSubscribeButton = "button[_ngcontent-server-app-c284][mat-raised-button]"
	let reSubscribeButton = "button[_ngcontent-server-app-c284][mat-raised-button]"
        let subscriberStatusDropdownMenu = "div.stats button[aria-haspopup='true']"
        let numberOfUnsubscribers = "div.selection-menu a:nth-of-type(5)"

  before(() => {
	// Improvement: Figure out a strategy to run for bigger and smaller devices
	// the assert in the test case below will have to change due to 
	// different HTML being presented due to viewport size.
        cy.viewport(1000, 660)	  
  	
	cy.visit(loginPath)
	cy.get(userNameField).type(userName)
	cy.get(passwordField).type(password)
	cy.get(loginButton).click()

	// Improvement: API Login
	// POST to /security/login2
	// with email, password, and recaptcha token
	// before, get recaptcha token via POST to google.com/recaptcha/api2 with userid ?
	// after login get activeTeamID and alias for reuse
	
  })

  it('A - UnSubscribe then ReSubscribe all users (Medium viewport)', () => {
	cy.intercept({
      		method: "POST",
      		url: "https://contacts.api.mailshake.com/contacts/get-stats",
    	}).as("waitForAllXHR");

	// Improvement: Load prospects link with activeTeamID parameter retrieved from API login
	// i.e. https://app.mailshake.com/49761/prospects/all
	cy.get(prospectsLink, { timeout: largeTimeout }).contains("Prospects").click()

	// Wait for all the Ajax to finish on the Prospects page  
        cy.wait("@waitForAllXHR", { timeout: largeTimeout }); 

        // Unsubscribe
	cy.get(selectAllProspectsCheckbox, { timeout: largeTimeout }).click()
	cy.get(unSubscribeButton, { timeout: largeTimeout }).first().click()
        cy.get(subscriberStatusDropdownMenu, { timeout: largeTimeout }).click()

	// Check new un subscribers in the UI 
	cy.get(numberOfUnsubscribers, { timeout: largeTimeout }).should('contain', '5')

	  
	cy.intercept({
      		method: "POST",
      		url: "https://contacts.api.mailshake.com/contacts/get-contacts",
    	}).as("waitForAllXHRMark2");

	// Resubscribe	
	cy.get(numberOfUnsubscribers, { timeout: largeTimeout }).click()
	cy.wait("@waitForAllXHRMark2", { timeout: largeTimeout }); 
	cy.get(selectAllProspectsCheckbox, { timeout: largeTimeout }).click()
	cy.get(reSubscribeButton, { timeout: largeTimeout }).first().click()
        cy.get(subscriberStatusDropdownMenu, { timeout: largeTimeout }).click()

	// Check number of unsubscribers in the UI after re subscribing  
	cy.get(numberOfUnsubscribers, { timeout: largeTimeout }).should('contain', '0')
  })

})
