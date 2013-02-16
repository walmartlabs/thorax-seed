describe("base", function() {
  it("should declare global libraries", function() {
    expect(Handlebars).to.be.ok;
    expect(Backbone).to.be.ok;
    expect(Thorax).to.be.ok;
  });
});