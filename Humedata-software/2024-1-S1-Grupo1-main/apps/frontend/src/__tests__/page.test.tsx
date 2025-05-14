import Page from "@/app/page"
import { render, screen } from "@testing-library/react"

describe("Page", () => {
  it("renders", () => {
    render(<Page />)
    expect(screen.getByText("Hello, world!")).toBeInTheDocument()
  })
})


