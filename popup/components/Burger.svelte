<script>
</script>

<div>
  <span />
  <span />
  <span />
</div>

<style lang="scss">
  @import "../styles/mixins";
  div {
    display: inline-block;
		cursor: pointer;

    & > span {
			display: block;

			background-color: var(--text-color);
			margin-bottom: 5px;

			height: 4px;
			border-radius: 8px;

      width: 25px;

			&:last-child {
        margin-bottom: 0;
        width: 15px;
      }
		}

    &:hover {
      & > span {
        background-color: var(--primary-color);
      }
    }
  }
</style>
