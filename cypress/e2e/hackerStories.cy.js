describe('Hacker Stories', () => {
  const initialTerm = 'React'
  const newTerm = 'Cypress'

  context('Hitting the Real API',() => {
    it('shows 20 stories, then the next 20 after clicking "More"', () => {
      cy.intercept(
        {method:'GET',
        pathname:'**/search'})
          .as('getStories')
      cy.visit('/')
      cy.wait('@getStories')
      cy.get('.item').should('have.length', 20)
      cy.contains('More').click()
      cy.wait('@getStories')
      cy.get('.item').should('have.length', 40)
    })

    it('searches via the last searched term', () => {
      cy.intercept({method:'GET',
                    pathname:'**/search**'})
                      .as('newSearch')
      cy.visit('/')
      cy.wait('@newSearch')
      cy.get('#search')
        .clear()

      cy.get('#search')
        .type(`${newTerm}{enter}`)

      cy.wait('@newSearch')

      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
        .click()

      cy.wait('@newSearch')

      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('contain', initialTerm)
      cy.get(`button:contains(${newTerm})`)
        .should('be.visible')
    })
  })

  context('Mocking the API',() => {
    beforeEach(() => {
      cy.intercept(
        'GET',
       `**/search?query=${initialTerm}&page=0`,
       { fixture: 'stories' })
       .as('getHome')
      cy.visit('/')
      // cy.assertLoadingIsShownAndHidden()
      cy.wait('@getHome')
        .its('response.statusCode')
        .should('eq', 200)
      // cy.contains('More').should('be.visible')
    })
    context('List of stories', () => {
      // Since the API is external,
      // I can't control what it will provide to the frontend,
      // and so, how can I assert on the data?
      // This is why this test is being skipped.
      // TODO: Find a way to test it out.
      it('shows the right data for all rendered stories', () => {
        cy.visit('/')
        // cy.wait('@getHome').its('response.body').should('eq',"exhaustive")
        cy.wait('@getHome')
          .its('response.body')
          .then((responseBody) => {
            expect(responseBody).to.not.be.empty
          })
      })
  
      it.only('shows only nineteen stories after dimissing the first story', () => {
        cy.visit('/')
        cy.wait('@getHome')
        cy.get('.button-small')
          .first()
          .click()
  
        cy.get('.item').should('have.length', 1)
      })
  
      // Since the API is external,
      // I can't control what it will provide to the frontend,
      // and so, how can I test ordering?
      // This is why these tests are being skipped.
      // TODO: Find a way to test them out.
      context.skip('Order by', () => {
        it('orders by title', () => {})
  
        it('orders by author', () => {})
  
        it('orders by comments', () => {})
  
        it('orders by points', () => {})
      })
  })
  
  // beforeEach(() => {
  //   cy.intercept(
  //     'GET',
  //    `**/search?query=${initialTerm}&page=0`,
  //    { fixture: 'stories' })
  //    .as('getHome')
  //   cy.visit('/')
  //   // cy.assertLoadingIsShownAndHidden()
  //   cy.wait('@getHome')
  //     .its('response.statusCode')
  //     .should('eq', 200)
  //   // cy.contains('More').should('be.visible')
  // })

    it('shows the footer', () => {
      cy.get('footer')
        .should('be.visible')
        .and('contain', 'Icons made by Freepik from www.flaticon.com')
    })
    // Hrm, how would I simulate such errors?
    // Since I still don't know, the tests are being skipped.
    // TODO: Find a way to test them out.
    context('Errors', () => {
      it('shows "Something went wrong ..." in case of a server error', () => {
        const erroServer = 'Something went wrong'

        cy.intercept(
          'GET',
          '**/search**',
          { statusCode: 500 }
        ).as('erroStatus')
    
        cy.visit('/')
        cy.wait('@erroStatus')
        cy.contains(erroServer)
          .should('be.visible')
      })

      it('shows "Something went wrong ..." in case of a network error', () => {
        const problemaInternet = 'Something went wrong'
  
        cy.intercept(
          'GET',
          '**/search**',
          { forceNetworkError:true }
        ).as('errorNetwork')
        
        cy.visit('/')
        cy.wait('@errorNetwork')
        cy.contains(problemaInternet)
          .should('be.visible')
      })
    })
  })

  context('Search', () => {
    beforeEach(() => {
      cy.intercept({method:'GET',pathname:'**/search**'}).as('newSearch')
      cy.visit('/')
      cy.wait('@newSearch')
      cy.get('#search')
        .clear()
    })

    it('types and hits ENTER', () => {
      cy.get('#search')
        .type(`${newTerm}{enter}`)
        cy.wait('@newSearch')

      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('contain', newTerm)
      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
    })

    it('types and clicks the submit button', () => {
      cy.get('#search')
        .type(newTerm)
      cy.contains('Submit')
        .click()

      cy.wait('@newSearch')

      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('contain', newTerm)
      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
    })

    context('Last searches', () => {
      it('shows a max of 5 buttons for the last searched terms', () => {
        const faker = require('faker')

        Cypress._.times(6, () => {
          cy.get('#search')
            .clear()
            .type(`${faker.random.word()}{enter}`)
          cy.wait('@newSearch')
        })

        cy.get('.last-searches button')
          .should('have.length', 5)
      })
    })
  })
})
