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
		background-color: var(--card-color);

    min-width: 290px;
    max-width: 500px;
    width: 100vw;
    padding: 16px;
		margin-block-end: 16px;

		& > h2 {
			margin: 0;
      font-size: 11pt;

      @include fluid-font(320px, 1024px, 20px, 29px);
		}
    & > p {
      @include fluid-font(320px, 1024px, 12px, 15px);
    }
    & > :global(.right) {
      position: relative;
      right: 0;
      left: 85%;
    }

		@media screen and (min-width: 400px) {
			@include border-radius(8px);
    }
	}
</style>
