// Here, the rule is violated by using a class component to define a form.
class ContactForm extends React.Component {
  render() {
    return (
      <form>
        <label>Name:</label>
        <input type="text" />
        <button type="submit">Submit</button>
      </form>
    )
  }
}

// Generated by gpt-4-0125-preview