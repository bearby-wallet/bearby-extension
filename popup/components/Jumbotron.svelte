<script lang="ts">
  export let title = '';
  export let description = '';
</script>

<div class="card">
  <h2>
    {title}
  </h2>
  <p>
    {description}
  </p>
  <slot />
</div>

<style lang="scss">
  @import "../styles/mixins";
  .card {
		background-color: var(--background-color);
    box-shadow: rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px, rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px;

    min-width: 290px;
    max-width: 500px;
    width: 100vw;
    padding: 16px;
		margin-block-end: 16px;

		& > h2 {
			margin: 0;
      @include fluid-text(1024px, 16pt, 20pt);
		}
    & > p {
      margin-block-start: 0;
      @include fluid-text(1024px, 10pt, 12pt);
    }
    & > :global(.right) {
      position: relative;
      right: 0;
      left: 85%;
    }

		@media screen and (min-width: 400px) {
			@include border-radius(16px);
    }
	}
</style>
