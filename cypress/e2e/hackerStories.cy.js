describe('Hacker Stories', () => {
  const initialTerm = 'React'
  const newTerm = 'Cypress'

  context('Hitting the Real API', () => {
    it('shows 20 stories, then the next 20 after clicking "More"', () => {
      cy.intercept(
        {
          method: 'GET',
          pathname: '**/search'
        })
        .as('getStories')
      cy.visit('/')
      cy.wait('@getStories')
      cy.get('.item').should('have.length', 20)
      cy.contains('More').click()
      cy.wait('@getStories')
      cy.get('.item').should('have.length', 40)
    })

    it('searches via the last searched term', () => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search**'
      })
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

  context('Mocking the API', () => {
    beforeEach(() => {
      cy.intercept(
        'GET',
       `**/search?query=${initialTerm}&page=0`,
       { fixture: 'stories' })
        .as('getHome')
      cy.visit('/')
      cy.wait('@getHome')
      //   .its('response.statusCode')
      //   .should('eq', 200)
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
          { forceNetworkError: true }
        ).as('errorNetwork')

        cy.visit('/')
        cy.wait('@errorNetwork')
        cy.contains(problemaInternet)
          .should('be.visible')
      })
    })

    it('shows the footer', () => {
      cy.get('footer')
        .should('be.visible')
        .and('contain', 'Icons made by Freepik from www.flaticon.com')
    })
    context('Footer and List of  stories', () => {
      const stories = require('../fixtures/stories')
      context('List of stories', () => {
        // Since the API is external,
        // I can't control what it will provide to the frontend,
        // and so, how can I assert on the data?
        // This is why this test is being skipped.
        // TODO: Find a way to test it out.
        it('shows the right data for all rendered stories', () => {
          cy.visit('/')
          cy.wait('@getHome')
            .its('response.body')
            .then((responseBody) => {
              console.log('Resposta da API', responseBody)
              expect(responseBody).to.not.be.empty
            })
          cy.get('.item')
            .should('have.length', 3)
          cy.get('.item')
            .should('contain', stories.hits[0].title)
            .and('contain', stories.hits[0].author)
            .and('contain', stories.hits[0].num_comments)
            .and('contain', stories.hits[0].points)
            .find('a')
            .should('have.attr', 'href', stories.hits[0].url)
        })

        it('shows only 2 stories after dimissing the first story', () => {
          cy.get('.button-small')
            .first()
            .click()

          cy.get('.item').should('have.length', 0)
        })

        // Since the API is external,
        // I can't control what it will provide to the frontend,
        // and so, how can I test ordering?
        // This is why these tests are being skipped.
        // TODO: Find a way to test them out.
        context('Order by', () => {
          it('orders by title', () => {
            cy.get('.list-header-button:contains(Title)')
              .first()
              .click()
              .as('orderByTitle')
          })

          it('orders by author', () => {})

          it('orders by comments', () => {})

          it('orders by points', () => {})
        })
      })
    })
  })

  context('Search the API', () => {
    beforeEach(() => {
      cy.intercept(
        'GET',
        `**/search?query=${initialTerm}&page=0`,
        { fixture: 'empty' })
        .as('getEmpty')

      cy.intercept(
        'GET',
        `**/search?query=${newTerm}&page=0`,
        { fixture: 'stories' })
        .as('getStories')

      cy.visit('/')
      cy.wait('@getEmpty')

      cy.get('#search')
        .clear()
    })

    it('types and hits ENTER', () => {
      cy.get('#search')
        .type(`${newTerm}{enter}`)
      cy.wait('@getStories')

      cy.get('.item').should('have.length', 3)
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

      cy.wait('@getStories')

      cy.get('.item').should('have.length', 3)
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
          cy.intercept(
            'GET',
            '**/search**',
            { fixture: 'empty' }
          ).as('emptyRamdomizer')
          cy.get('#search')
            .clear()
            .type(`${faker.random.word()}{enter}`)
          cy.wait('@emptyRamdomizer')
        })

        cy.get('.last-searches button')
          .should('have.length', 5)
      })
    })
  })
})
