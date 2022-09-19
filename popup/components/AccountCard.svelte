<script lang="ts">
  import type { Account } from 'types';

  import { AccountTypes } from 'config/account-type';

  import { trim } from 'popup/filters/trim';
  import { formatNumber } from 'popup/filters/numbers';

  export let account: Account;
  export let selected = false;
</script>

<div class="wrapper">

</div>

<style lang="scss">
	@import "../styles/mixins";
</style>
